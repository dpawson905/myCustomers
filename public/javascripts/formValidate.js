$(function () {
  $("#formValidate").validate({
    rules: {
      firstName: {
        required: true,
        minLength: 3
      },
      email: {
        required: true,
        email: true
      }
    },
    messages: {
      firstName: {
        required: "First name is required",
        minLength: "Enter at least 3 characters"
      },
      email: {
        required: "Email address is required",
        email: "Must be a valid email address"
      }
    },
    errorElement: 'div',
    errorPlacement: function (error, element) {
      var placement = $(element).data('error');
      if (placement) {
        $(placement).append(error)
      } else {
        error.insertAfter(element);
      }
    }
  })
})