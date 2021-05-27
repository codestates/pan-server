//작성자:김현영
//그룹에서 작성한 공개 다이어리 목록입니다.
//로그인 상태인 경우 내가 속한 그룹의 비공개 일기도 볼 수 있습니다.

const sequelize = require("sequelize")
const { Diary,User,Book } = require( '../../models');

module.exports = async (req, res) => {
    const groupDiaryList = await Diary.findAll({
        where: { 
            private: false, 
            },
        attributes: [
            [sequelize.col("User.username"), "writer"], //sequelize.col() : Creates an object which represents a column in the DB, this allows referencing another column in your query.
            "title",
            "weather",
            "content",
            "createdAt",
            "updatedAt"   
        ],
        include: [
            {
                model: User,
                attributes:[]
            },
             {
                model: Book,
                where: { groupId : {[sequelize.Op.ne]: null} },   //그룹일기
                attributes: []
            }
       ]
    })
    res.status(200).json({data: groupDiaryList, message:'공개된 개인 일기의 목록입니다.'})
}