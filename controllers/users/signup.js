//작성자:김현영
const {user} = require('../../models/user');
module.exports = {

    /*
    - userEmail이 이미 db에 존재할 경우 에러메세지 409 (충돌 시 에러 코드)
    - 필요한 모든 정보를 입력받지 못한 경우 에러 메세지 422 (처리할 수 없는 엔티티에 대한 에러 코드)
    - 존재하지 않을 경우 201코드와 userInfo 전송 (성공적으로 작성되었을 때 보내는 에러 코드)
    */
    
    signup: async (req, res) => {
        const {userName, email, password,} = req.body;
        
        if(!userName || !email || !password) {             // - 필요한 모든 정보를 입력받지 못한 경우 에러 메세지 422
            res.status(422).send('필수 입력 사항을 모두 입력해주세요.')
        }
        //db에 email 정보를 찾아보고 없을 경우 새로운 정보를 생성한다.
        await user.findOrCreate({
            where:{
                email
            },
            defaults:{
                userName,
                password
            }
        })
        .then(([userObj, isCreated])=>{ // findOrCreate 메소드의 반환값으로서 검색/생성된 객체를 포함하는 배열과 불린값을 전달받는다.
            if(!isCreated){
                res.status(409).send('이미 존재하는 이메일입니다.')   //새로 생성되지 않고 찾은 값이므로 409에러 메세지를 전송한다.
            }
            res.status(201).send(userObj)
        })
    }
}