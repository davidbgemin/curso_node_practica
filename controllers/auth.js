const { response } = require('express');
const bcryptjs = require('bcryptjs')

const Usuario = require('../models/usuario');

const { generarJWT } = require('../helpers/generar-jwt');
const { googleVerify } = require('../helpers/google-verify');
const { DefaultTransporter } = require('google-auth-library');


const login = async(req, res = response) => {

    const { correo, password } = req.body;

    try {
      
        const usuario = await Usuario.findOne({ correo });
        // verificando si el usuario existe:
        if ( !usuario ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - correo'
            });
        }

        // verificando si el usuario está activo:
        if ( !usuario.estado ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - estado: false'
            });
        }

        // verificando la contraseña:
        const validPassword = bcryptjs.compareSync( password, usuario.password );
        if ( !validPassword ) {
            return res.status(400).json({
                msg: 'Usuario / Password no son correctos - password'
            });
        }

        // generando el jwt:
        const token = await generarJWT( usuario.id );
        // console.log(token); 
        // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MjZjYmRjOWM4YWY3MjYzMDM5M2E1ZWIiLCJpYXQiOjE2NTEyOTM2NzEsImV4cCI6MTY1MTMwODA3MX0.vs69QEG2yKOT_RracL0JFRkwM48q20BNrVpm6iZcgoM
        
        res.json({
            usuario,
            token
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'Hable con el administrador'
        });
    }   

}

const googleSignIn = async(req, res=response) => {
    const {id_token} = req.body;

    try {
        // const googleUser = await googleVerify(id_token);
        const {correo, nombre, img} = await googleVerify(id_token);
        // console.log(googleUser);

        let usuario = await Usuario.findOne({correo})

        // si el usuario no existe, lo creamos con las credenciales de google
        if (!usuario) {
            const data = {
                nombre,
                correo,
                role: DefaultTransporter,
                password: ':o',
                img,
                google: true
            }
            usuario = new Usuario(data);
            await usuario.save();
        }

        // si el usuario en DB:
        if(!usuario.estado) {
            return res.status(401).json({
                msg: 'hable con el admin. Usuario bloqueado'
            })
        }

        // genera el jwt:
        const token = await generarJWT(usuario.id);


        res.json({
            // msg: 'Todo bien!',
            // id_token
            usuario,
            token
        })
        
    } catch (error) {
        res.status(400).json({
            msg: 'El token no se pudo verificar'
        })
    }
}

module.exports = {
    login, googleSignIn
}
