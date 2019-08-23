$(function(){
  $('#subscribeForm').submit(function(e){
    e.preventDefault();

    var name = $('input[name="name"]').val();
    var email = $('input[name="email"]').val();
    var body = {
      name, email,
      type: 'subscription'
    }

    $.ajax({
        type: 'POST',
        url: 'https://fu96i2tkbc.execute-api.eu-central-1.amazonaws.com/dev/email',
        data: JSON.stringify(body),
        contentType: 'application/json',
      }).done(function (data) {
        if (data.error) {
          $('#network-message').html(data.error);
        }else{
          $('#subscribeForm').toggle();
          $('#thank-you').toggle();
        }
      }).fail(function (data) {
        $('#network-message').html('Oh no, something went wrong');
      });

  })
});


function isBlank(str) {
  return (!str || /^\s*$/.test(str));
}

function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}
