//작성자:김현영
const db = require('../../models');
const {user} = require('../../models/user');
const crypto = require('crypto');

module.exports = {

    /*
    1.userEmail이 이미 db에 존재할 경우 에러메세지 409 (충돌 시 에러 코드)
    2.필요한 모든 정보를 입력받지 못한 경우 에러 메세지 422 (처리할 수 없는 엔티티에 대한 에러 코드)
    3.존재하지 않을 경우 
        1) 암호화된 비밀번호와 salt 값을 db에 저장한다.
        2. 201코드와 userInfo 전송 (성공적으로 작성되었을 때 보내는 에러 코드)
    */
    
    signup: async (req, res) => {
        const {userName, email, password} = req.body;

        //crypto 모듈의 randomBytes 메소드를 통해 비밀번호를 암호화할 때 필요한 salt 값을 생성한다.
        const createSalt = () =>
            new Promise((resolve, reject) =>{
                crypto.randomBytes(64, (err,buf)=>{
                    if(err){
                        reject(err)
                    }
                    resolve(buf.toString('base64'));
                })
            })

        //sha-512로 해싱한 암호화된 비밀번호와 salt값을 함께 반환한다. 
        const createHashPassword = (password) =>{
            new Promise(async (resolve, reject)=> {
                const salt = await createSalt();
                crypto.pbkdf2(password, salt, 101345, 64, 'sha512', (err, key) => {
                    if(err){
                        reject(err)
                    }
                    resolve({password: key.toString('base64'), salt});
                })
            })
        }

        //db에 담을 salt값과 암호화된 비밀번호를 변수에 담는다.
        const {hashedPassword, salt} = await createHashPassword(password);


        // 2.필요한 모든 정보를 입력받지 못한 경우 에러 메세지 422
        if(!userName || !email || !password) {             
            res.status(422).send('필수 입력 사항을 모두 입력해주세요.')
        }
        //db에 email 정보를 찾아보고 없을 경우 새로운 정보를 생성한다.

        await user.findOrCreate({
            where:{
                email
            },
            defaults:{
                userName:userName,
                password:hashedPassword,
                salt:salt
            }
        })
        .then(([userObj, isCreated])=>{ // findOrCreate 메소드의 반환값으로서 검색/생성된 객체를 포함하는 배열과 불린값을 전달받는다.
            if(!isCreated){
                res.status(409).send('이미 존재하는 이메일입니다.')   //1. 새로 생성되지 않고 이미 존재하는 이메일을 찾았으므로 409에러 메세지를 전송한다.
            }
            res.status(201).send(userObj) //3. 입력받은 값으로 회원가입
        })
    }
}

/*
zerocho 님의 포스팅 내용 중
비밀번호에 salt 문자열을 붙여서 수만번 반복 해시화한다. salt는 랜덤 문자열이므로 비밀번호와 함께 db에 저장해야 한다.
위에 작성한 내용은 randomBytes 메서드로 64바이트 길이의 salt를 생성한다.
buf는 버퍼 형식이므로 buf.toString('base64')로 base64 문자열 salt로 변환한다.
pbkdf2 메소드는 단방향 암호화할 때 쓰이는데 비밀번호를 굳이 복호화할 필요가 없을 것 같아서 사용!
pbkdf2에는 인자가 5개 들어간다.(비밀번호, salt, 반복 횟수, 비밀번호 길이, 해시 알고리즘)
key가 버퍼 형식이므로 문자열로 만들어서 저장해야 한다.
반복횟수는 불규칙한 숫자를 쓰면된다고 해서 랜덤으로 작성했다.
*/
