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
            }))

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

            return res.status(201).json(newProblem);
        }
     } catch (error) {
        
     }


}

export const getAllProblems = async (req, res) =>{}

export const getProblemById = async (req, res) => {}

export const updateproblem = async (req, res ) => {}

export const deleteProblem = async (req, res) => {}

export const getAllProblemsSolvedByUser = async (req,res) => {} 
