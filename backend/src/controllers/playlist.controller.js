import { db } from "../libs/db.js";


export const createPlaylist = async(req, res) =>{
    try {
         const {name, description} = req.body;

         const userId  = req.user.id;

         const playlist = await db.playlist.create({
            data:{
                name,
                description,
                userId
            }
         });
         res.status(200).json({
            success:true,
            message:"Playlist creatred Successfully", 
            playlist})

    } catch (error) {
        console.error('Error creating playlist:' , error);
        res.status(500).json({
            error:'Failed to create playlist'
        });
    }
}

export const  getAllListDetails = async(req, res) =>{
    try {
        const playlists =  await db.playlist.findMany({
            where:{
                userId:req.user.id
            },
            include:{
                problems:{
                    include:{
                        problem:true
                    }
                }
            }
        });

        res.status(200).json({
            success:true,
            message:"Playlist fetched successfully",
            playlists
        })
    } catch (error) {
        console.error('Error fetching playlist:' , error);
        res.status(500).json({
            error:'Failed to fetch playlist'
        });
    }
}

export const  getPlayListDetails = async (req, res) =>{
    const{playlistId} = req.params;
    try {
        const playlist = await db.playlist.findUnique({
            where:{
                id:playlistId,
                userId:req.userid
            },
            include:{
                problems:{
                    include:{
                        problem:true
                    }
                }
            }
        });
        if(!playlist){
            return res.status(404).json({error:"Playlist not found" });
        }
        
         res.status(200).json({
            success:true,
            message:"Playlist fetched successfully",
            playlist,
        })

    } catch (error) {
        console.error('Error fetching playlist:' , error);
        res.status(500).json({error:'Failed to fetch playlist'});
    }
}

export const  addProblemToPlaylist = async (req ,res) => {
    const {playlistId}  = req.params;
    const {problemIds} = req.body;
    try {
        if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json({error:"Invalid or missing problemId"})
        }

        //create records from each problem in the playlist
        const  problemInPlaylist = await db.problemInPlaylist.createMany({
            data:problemIds.map((problemId) => ({
                playlistId,
                problemId
            }))
        })

        res.status(201).json({
            success: true,
            message: 'Problem added to playlist sucessfully',
            problemInPlaylist,
        })


    } catch (error) {
        console.error('Error Adding problem in playlist:' , error);
        res.status(500).json({error:'Failed to Adding problem in playlist'});
    }
}

export const  deletePlaylist = async (req, res) =>{
    const {playlistId} = req.params;

    try {
        const deletePlaylist = await db.playlist.delete({
            where:{
                id:playlistId
            }
        });

        res.status(200).json({
            success: true,
            message: 'Playlist deleted sucessfully',
            deletePlaylist,
        })
    } catch (error) {
         console.error('Error Deleting playlist:' , error);
        res.status(500).json({error:'Failed to delete playlist'});
    }
}

export const  removeProblemFromPlaylist = async (req, res) => {
      const {playlistId} = req.params;
      const {problemIds} = req.body;
    try {
         
       if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json({error:"Invalid or missing problemId"})
       }
       const deletedProblem = await db.problemInPlaylist.deleteMany({
        where:{
            playlistId,
            problemId:{
                in:problemIds
            }
        }
       })

         res.status(200).json({
            success:true,
            message:'Problem removed from playlist successfully',
            deletedProblem,
         })
    } catch (error) {
        console.error('Error Removing problem from playlist:' , error);
        res.status(500).json({error:'Failed to remove problem from playlist'});
    }
}
