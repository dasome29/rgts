"use strict";
import nodemailer from "nodemailer";

export async function sendEmail(to: string, text:string) {
 
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,  
    auth: {
      user: 'x7z3n7a3xvenhmx3@ethereal.email',  
      pass: 'epyvG4AaJmPeAmCk3y',  
    },
  });

  let info = await transporter.sendMail({
    from: 'David Solís', 
    to: to,  
    subject: "Change Password",  
    html: text,  
  });


  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}