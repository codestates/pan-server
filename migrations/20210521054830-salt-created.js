'use strict';
//작성자:김현영
//회원가입 중 사용자 비밀번호 암호화를 위해 salt값을 db에 저장할 필요가 있어서 salt필드를 생성했다.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("users", "salt",{
      type: Sequelize.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("users", "salt");
  }
};
