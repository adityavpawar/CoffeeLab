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

         const submission = stdin.map((input) => ({
              source_code,
              language_id,
              stdin: input,
             
         }));

         //send this batch to judge0
         const submitResponce = await submitBatch(submission)

         const token  = submitResponce.map((res) => res.token)

        //poll judge0 for results of all submitted test cases

         const results = await pollBatchResults(token);

         //
         

    } catch (error) {
        
    }
}