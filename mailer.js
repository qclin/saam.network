const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');

// MAILER
const smtpConfig = {
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 465,
    secure: true,
    requireTLS: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
};
const transport = nodemailer.createTransport(smtpConfig);

const CORSHeaders = {
    "Access-Control-Allow-Origin": "*", // Required for CORS support to work
    "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
};


// DYNAMO DB
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

module.exports.email  = async (event, context, callback) => {
    let body = JSON.parse(event.body);
    let type = body.type;
    try {
        await subscribeToMaillist(body);
        const response = {
            statusCode: 200,
            headers: CORSHeaders,
            body: JSON.stringify({"message": "OK"})
        }
        callback(null,response);
    } catch (error) {
        console.log(error);
        const response = {
            statusCode: 503,
            headers: CORSHeaders,
            body: JSON.stringify({ "message": "Server error " + error.toString() })
        };
        callback(null, response);
    }

}


async function subscribeToMaillist(body) {

    // params to look for existing email in DB
    const getItemParams = {
        TableName: process.env.EMAIL_TABLE,
        Key: {
            "email": body.email
        }
    };

    let data = await docClient.get(getItemParams).promise();
    if (data.Item) {
        throw 'email already exists ' + body.email
    } else {
        // save email in DB
        const putItemParams = {
            TableName: process.env.EMAIL_TABLE,
            Item: {
                email: body.email,
                name: body.name,
                signUpDate: new Date().toISOString(),
            }
        };
        await docClient.put(putItemParams).promise();
        sendConfirmation(body);
    }
}

async function sendConfirmation(body){

    var message = `Dear ${body.name}, \n\n Thanks for your interest in updates from SAAM. If you have received this message in error, please let us know by replying to this email.`
    var subject = `subscribe to SAAM`

    var mailOption = {
      from: `"SAAM.network" <${process.env.MAIL_FROM}>`,
      to: [{ name: body.name, address: body.email}],
      subject: subject,
      text: message
    }

    try {
        await transport.sendMail(mailOption);
    } catch (err) {
        console.log(err);
    }
}
