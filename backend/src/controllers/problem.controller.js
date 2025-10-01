import { db } from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";


export const createProblem = async (req, res) => {
    //going to get the data from request body
    const {title, description, difficulty, tags, example, contraints, testcases, codeSnippets,
        referenceSolutions
    } = req.body;
    
    //going to check the user role once again
    if(req.user.role !== "ADMIN"){
        return res.status(403).json({error:"You are not allowed to create a problem"})
    }

    //check if the problem already exists

     try {
        for(const [language, solutionCode] of Object.entries(referenceSolutions)){
            const languageId = getJudge0LanguageId(language);

            if(!languageId){
                return res.status(400).json({error:`Language ${language} is not supported`})
            }

            const submissions = testcases.map(({input, output}) => ({
                source_code:solutionCode,
                language_id:languageId,
                stdin:input,
                expected_outut:output,
            }));

            const submissionsResults = await submitBatch(submissions);

            const tokens = submissionsResults.map((res) => res.token);

            const results = await pollBatchResults(tokens);

            for(let i = 0; i < results.length; i++ ){
                const result = results[i];
                
                if(result.status.id !== 3){
                    return res.status(400).json({error: `Testcse ${i+1} failed for language ${language}`});
                }
            }

            const newProblem = await db.problem.create({
                data:{
                    title, description, difficulty, tags, example, contraints, testcases, codeSnippets,
        referenceSolutions, languageId, userId: req.user.id,
                },
            });

            return res.status(201).json({
                success:true,
                message:"Message Created Successfully",
                problem:newProblem
            });
        }
     } catch (error) {
        console.log(error);
        return res.status(500).json({
           error:"Error While Creating Problem",
        });
     }

}

export const getAllProblems = async (req, res) =>{
     try {
        const problems = await db.problem.findMany();

        if(!problems){
            return res.status(400).json({
                error:"No problem found"
            })
        }

         return res.status(200).json({
                success:true,
                message:"Message Fetched Successfully",
                problems
            });

     } catch (error) {
         console.log(error);
        return res.status(500).json({
           error:"Error While Fetching Problems",
        });
     }
};

export const getProblemById = async (req, res) => {
     const {id} = req.params;

     try {
        const problem = await db.problem.findUnique({
            where:{
               id
            }
        })

        if(!problem){
            return res.status(404).json({error:"Problem not found"})
        }

        return res.status(200).json({
                success:true,
                message:"Message Created Successfully",
                problem
        });
     } catch (error) {
        console.log(error);
        return res.status(500).json({
           error:"Error While Fetching Problem by id",
        });
     }
};

export const updateproblem = async (req, res ) => {
    try {
    const { id } = req.params;

    const {title, description, difficulty, tags, examples, constraints, testCases, codeSnippets, referenceSolutions,} = req.body;

    const problem = await db.problem.findUnique({ where: { id } });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    if (req.user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'Forbidden: Only admin can update problems' });
    }

    // Step 1: Validate each reference solution using testCases
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Unsupported language: ${language}` });
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      // console.log('Submissions:', submissions);

      // Step 2.3: Submit all test cases in one batch
      const submissionResults = await submitBatch(submissions);

      // Step 2.4: Extract tokens from response
      const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      // Step 2.6: Validate that each test case passed (status.id === 3)
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Validation failed for ${language} on input: ${submissions[i].stdin}`,
            details: result,
          });
        }
      }
    }

    // Step 3. Update the problem in the database

    const updatedProblem = await db.problem.update({
      where: { id },
      data: {title, description, difficulty, tags, examples, constraints, testCases, codeSnippets,referenceSolutions,},
    });

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      problem: updatedProblem,
    });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ error: 'Failed to update problem' });
  }
};


export const deleteProblem = async (req, res) => {
    const {id} = req.params;
    
    try {
        const problem = await db.problem.findUnique({ where: { id}});

        if(!problem){
            return res.status(404).json({error:"Problem Not found"});

        }
        await db.problem.delete({ where: { id }});

        res.status(200).json({
            success:true,
            message: "Problem deleted Successfully",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
           error:"Error While Deleting the Problem",
        });
    }
}

export const getAllProblemsSolvedByUser = async (req,res) => {
  try {
    const problem = await db.problem.findMany({
      where:{
        solvedBy:{
          some:{
            userId:req.user.id
          }
        }
      },
      include:{
        solvedBy:{
          where:{
            userId:req.user.id
          }
        }
      }
    })

    res.status(200).json({
      success:truw,
      message:"Problems fetched successfully",
      problems
    })
  } catch (error) {
    console.error("Error fetching Problem: ",error);
    res.status(500).json({error:"Failed to fetch problem"})
  }
} 
