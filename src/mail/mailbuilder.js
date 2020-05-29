



function build(data){

    let id = Math.floor(Math.random() * 10000).toString().padStart(5, '0');

    let messageData = `From: ${data.from}
To: ${data.to}
Subject: ${data.subject}
Date: ${new Date().toISOString()}
Message-ID: ${id + data.sender}
Content-Type: ${data.content}

${data.body}`;

    let buffer = Buffer.from(messageData);
    return buffer.toString('base64');
}



module.exports = build
