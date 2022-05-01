const { response } = require('express');
const bcryptjs = require('bcryptjs')

const Usuario = require('../models/usuario');

const { generarJWT } = require('../helpers/generar-jwt');


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



module.exports = {
    login
}
