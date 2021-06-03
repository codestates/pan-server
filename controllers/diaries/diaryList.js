//작성자:김현영
//개인이 작성한 공개 다이어리 목록입니다.
//로그인 상태인 경우 로그인한 사용자의 비밀일기까지 보여줍니다 - 나중에
const sequelize = require("sequelize")
const { Diary,User,Book,Like,Comment } = require( '../../models');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
   
    const authorization = req.headers.authorization;  

    if(!authorization){
        condition = {private:false}
    }
    else{
        const token = authorization.split(' ')[1];
        const data = jwt.verify(token, process.env.ACCESS_SECRET);
        const userInfo = await User.findOne({ where: { id: data.id } });

        if(userInfo){
            condition = {
                [sequelize.Op.or]:[
                {private: false}, //공개 일기이거나 
                {[sequelize.Op.and]: [{private:true}, {userId : userInfo.id }]} // 비공개일기지만 유저 아이디가 일치하는 일기를 condition에 값으로 넣는다.
             ]
            }
        }condition = {private:false}
    }
   
    const diaryList = await Diary.findAll({
        where: //{private: false},
        condition,

        attributes: [
            [sequelize.col("username"), "writer"], //sequelize.col() : Creates an object which represents a column in the DB, this allows referencing another column in your query.
            "type",
            "title",
            "weather",
            "content",
            "private",
            "picUrl",
            "date",
            "feelings",
            [sequelize.col("like"), "like"],
            "createdAt",   //고민: Diaries 테이블의 컬럼을 모두 포함하고 User 테이블의 username만 가져올 순 없나
            "updatedAt"   
        ],
        include: [
            {
                model: User,
                required: false,
                attributes:[]   //고민: 위에 attributes를 비우고 여기에 username을 넣으면 Diaries 테이블의 모든 컬럼을 포함하지만 username의 경우 User 컬럼 안에 객체로 들어가게 됨.
            },
             {
                model: Book,
                //where: { groupId :null},   //개인일기
                attributes: []
            },
            {
                model: Like,
                required: false,
                attributes: []
            },
            {
                model: Comment,
                required: false,
                attributes: [
                    "userId", // should be changed to [sequelize.col("username"), "username"]
                    "text"                    
                ],
                order: [ ['createdAt', 'DESC']]
            }
        ],
        order:[ ['createdAt', 'DESC'] ], //The order option takes an array of items to order the query by or a sequelize method. These items are themselves arrays in the form [column, direction].
        
   })
    res.status(200).json({data: diaryList, message:'공개된 개인 일기의 목록입니다.'})
}
