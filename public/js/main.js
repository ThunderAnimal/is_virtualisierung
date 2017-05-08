 $(document).ready(function(){
 	
 	$(".button-collapse").sideNav();

  $('ul.tabs').tabs({ 'swipeable': true , heightStyle: "fill" });

  $('#googleMap').height($( window ).height() - 112);
  
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&'+'callback=initialize';
  document.body.appendChild(script);

});

  function loadKey() {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src ="https://maps.googleapis.com/maps/api/js?key=AIzaSyCwWBLT5II8keeKom6TKDZUt1_XjbBggvQ&callback=initialize";
      document.body.appendChild(script);

      }
  function initialize() {
      var map = new google.maps.Map(document.getElementById('googleMap'), {
        center: {lat: 52.520008, lng: 13.404954},
        scrollwheel: true,
        zoom: 12
        });
      }
