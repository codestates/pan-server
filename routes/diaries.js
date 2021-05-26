const express = require('express');
const router = express.Router();
const { upload } = require("./multer");

const {
    diary,
    diaryList,

} = require('../controllers/diaries');

// * POST /diaries/upload
router.post("/diaries/upload", upload.single('img'), async (req, res) => {
    const picUrl = await req.file.location // 이미지 URL 정보가 담긴 곳
    console.log(req.file)
    res.json({ picUrl: picUrl, message: '그림이 등록되었습니다.' })
}); // S3에 이미지 업로드 라우터

// router.post("/diaries/upload", upload.single('img'), async (req, res) => {
//         const picUrl = await req.file.filename
//         console.log(req.file)
//         res.json({ picUrl: picUrl, message: '그림이 등록되었습니다.' })
//     }); // 이미지 업로드 로컬 테스트용

// * POST /diaries
router.post("/diaries", diary.post); // 일기 업로드 라우터

// * GET / diaries
router.get("/diaries", diaryList);


module.exports = router;
