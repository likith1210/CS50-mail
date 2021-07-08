document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function send_email() {
  rec=document.querySelector('#compose-recipients').value;
  sub=document.querySelector('#compose-subject').value;
  bod=document.querySelector('#compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: rec,
        subject: sub,
        body: bod
    })
  })
  .then(response => response.json())  
  load_mailbox('sent');
  
  return false;
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-inbox').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-inbox').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-list').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    n=emails.length;
    
    document.querySelector('#table-body').innerHTML=""
    for(i=0;i<n;i++){
      read="";
      if(mailbox==='sent')
      {
        sent=emails[i].recipients;
      }
      else if(mailbox==='inbox')
      {
        if(emails[i].read){
          read="read";
        }
        sent=emails[i].sender;
      }
      else
      {
        sent=emails[i].sender;
      }
      sub=emails[i].body;
      time=emails[i].timestamp;
      var body = document.createElement('tr');
      body.className = `row border ${read}`;
      body.innerHTML = `
        <td class='col-lg-3'><h5>${sent}</h5></td>
        <td class='col-lg-6'><h6>${sub}<h6></td>
        <td class='col-lg-3'><h6>${time}</h6></td>`;

      document.querySelector('#table-body').appendChild(body);
      let mail_id = emails[i].id;
      body.addEventListener('click', () =>{
        view_email( mail_id, mailbox);
      })
    }
  });
}

function view_email(id,mailbox) {
  document.querySelector('#emails-inbox').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-view').innerHTML="";

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(emails => {
    send=emails.sender;
    sub=emails.subject;
    time=emails.timestamp;
    mail_body=emails.body;

    var body=document.createElement('div');
    body.innerHTML=`<div class='row'><h4>From : ${send}</h4></div>
          <div class='row'><h4>Subject : ${sub}</h4></div>
          <div class='row'><h4>Time : ${time}</h4></div>
          <div id='body-content'><h5>${mail_body}</h5></div>`
    document.querySelector('#emails-view').appendChild(body);

    if(mailbox=="sent"){
      return
    }
    let archive = document.createElement("btn");
    archive.className = `btn btn-outline-info`;
    archive.addEventListener("click", () => {
      toggle_archive(id, emails.archived);
      if (archive.innerText == "Archive") archive.innerText = "Unarchive";
      else archive.innerText = "Archive";
    });

    if (!emails.archived) archive.textContent = "Archive";
    else archive.textContent = "Unarchive";
    document.querySelector("#emails-view").appendChild(archive);
  }); 
  make_read(id);

}

function make_read(id) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

function toggle_archive(id, state) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !state,
    }),
  });
}