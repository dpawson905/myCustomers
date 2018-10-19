$(function () {
  $('.tel').mask('(000) 000-0000');

  function populate(selector) {
    var select = $(selector);
    var hours, minutes, ampm;
    for (var i = 420; i <= 1145; i += 15) {
      hours = Math.floor(i / 60);
      minutes = i % 60;
      if (minutes < 10) {
        minutes = '0' + minutes; // adding leading zero
      }
      ampm = hours % 24 < 12 ? 'AM' : 'PM';
      hours = hours % 12;
      if (hours === 0) {
        hours = 12;
      }
      let selectTime = hours + ':' + minutes + ' ' + ampm;
      select.append($('<option></option>')
        .attr('value', selectTime)
        .text(selectTime));
    }
  }

  populate('#timeSelect'); // use selector for your select

})