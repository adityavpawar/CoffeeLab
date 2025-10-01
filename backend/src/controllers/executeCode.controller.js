import { db } from "../libs/db.js";
import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const executeCode = async(req, res) => {
    try {
        const {source_code , language_id , 
            stdin , expected_outputs , problemId} = req.body;

        const userId = req.user.id;

        //validate test case
         if(
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
         ){
            return res.status(400).json({error:"Invalid or Missing test cases"})
         }
         //test case batch for judge0 batch submission

         const submissions = stdin.map((input) => ({
              source_code,
              language_id,
              stdin: input,
             
         }));

         //send this batch to judge0
         const submitResponce = await submitBatch(submissions);

         const token  = submitResponce.map((res) => res.token);

        //poll judge0 for results of all submitted test cases

         const results = await pollBatchResults(token);

         //analyze test case result

          let allPassed = true;
          const detailedResults = results.map((result, i) =>{

            const expected_output = expected_outputs[i]?.trim();
            const passed = stdout === expected_output;

            if(!passed) allPassed = false;

            return{
                testCase:i+1,
                passed,
                stdout,
                expected:expected_output,
                stderr:result.stderr || null,
                compile_output:result.compile_output || null,
                status:result.status.description,
                memory:result.memory ? `${result.memory} KB`: undefined,
                time:result.time ? `${result.time} s`: undefined
            }
          })
           // store submission summary
            const submission  = await db.submission.create({
                data:{
                    userId,
                    problemId,
                    sourceCode:source_code,
                    language:getLanguageName(language_id),
                    stdin:stdin.join("/n"),
                    stdout:JSON.stringify(detailedResults.map((r)=>r.stdout)),
                    stderr:detailedResults.some((r)=>r.stderr)
                    ? JSON.stringify(detailedResults.map((r) =>r.stderr))
                    : null,
                    compileOutput:detailedResults.some((r)=>r.compile_output)
                    ? JSON.stringify(detailedResults.map((r) =>r.compile_output))
                    : null,
                    status:allPassed ? "Accepted": "Wrong Answer",
                    memory:detailedResults.some((r)=>r.memory)
                    ? JSON.stringify(detailedResults.map((r) =>r.memory))
                    : null,
                    time: detailedResults.some((r)=>r.time)
                    ? JSON.stringify(detailedResults.map((r) =>r.time))
                    : null,
                },
            });

            //all passed mark problem is equal to true mark solved

            if(allPassed){
                await db.problemSolved.upsert({
                    where:{
                        userId_problemId:{
                            userId , problemId  
                        }
                    },
                    update:{},
                    create:{
                        userId , problemId
                    }
                })
            }

            // save individual test case
            const testCaseResults = detailedResults.map((result) =>({
                submissionId: submission.id,
                testCase: result.testCase,
                passed: result.passed,
                stdout: result.stdout,
                expected: result.expected,
                stderr: result.stderr,
                compileOutput: result.compile_output,
                status: result.status,
                memory: result.memory,
                time: result.time,
            }))
            await db.testCaseResult.createMany({
                data:testCaseResults
            })
            //
            const submissionWithTestCase = await db.submission.findUnique({
                where:{
                    id:submission.id
                },
                include:{
                    testCase:true
                }
            })

         res.status(200).json({
            success:true,
            message:"Code Executed! Successfully",
            submission:submissionWithTestCase
         })

    } catch (error) {
        console.error("Error executing code:", error.message);
        res.status(500).json({error:"Failed to execute code"});
    }
};