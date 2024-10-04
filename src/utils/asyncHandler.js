const asyncHandler=(requestHanlder)=>{
   return (req, res, next)=>{
        Promise.resolve(requestHanlder(req, res, next)).catch((err)=> next(err))
    }
}

export {asyncHandler}



// same code by another way i.e try and catch

// const asyncHandler=(fun)=>async(req,res,next)=>{
//     try {
//         await fun(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }