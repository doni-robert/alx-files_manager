const redis = require('../utils/redis');
const dbClient = require('../utils/db');
const auth = require('basic-auth');
const { v4: uuid } = require('uuid')
const sha1 = require('sha1');


class AuthController {
    static async getConnect(req, res){
        let foundUser;
        try {
            const user = auth(req)
            if (!user) {throw new Error()}
            const password = sha1(user.pass);
            const email = user.name;

            foundUser = await dbClient.db.collection('users').findOne({
                email,
                password,
            })
        } catch(error) {
            return res.status(401).send({error: "Unauthorized"})
        }

        const token = uuid();
        const key = `auth_${token}`
        await redis.set(key, foundUser._id.toString(), 86400);
        return res.status(200).send({ token })

    }

    static async getDisconnect(req, res) {
        try {
            const token = req.header('X-Token');
            
            const user = await redis.get(`auth_${token}`)
            if (!user || !token) {throw new Error()};
            await redis.del(`auth_${token}`)

            return res.status(204).send();
        } catch {
            return res.status(401).send({error: "Unauthorized"})

        }
    }

}

module.exports = AuthController