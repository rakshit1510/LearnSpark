import multer from 'multer'
const storage= multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./public/temp") // No error, save in "./public/temp"
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
    }
    
})
console.log("file saved")
export const upload = multer({
    storage
})