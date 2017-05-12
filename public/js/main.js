 $(document).ready(function(){
 	
 	$(".button-collapse").sideNav();

  $('ul.tabs').tabs({ 'swipeable': false });


  
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&'+'callback=initialize';
  document.body.appendChild(script);

  $('#googleMap').height($( window ).height() - 112);
  $('#filterContainer').height($( window ).height() - 112);
  $('.tabs-content').height($( window ).height() - 112);

 
  

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
		
		
		var count = 0;
		var positionList = new Array("52.520000;13.404950", "52.510000;13.414950", "52.500000;13.404950");
		//die Marker wurde online unter http://earth.google.com/images/kml-icons/track-directional/track-0.png genommen
		while(count < positionList.length ){
		  
		  var lat=parseFloat(positionList[count].split(';')[0]).toFixed(7);
		   var long=parseFloat(positionList[count].split(';')[1]).toFixed(7);
		   
		 var marker = new google.maps.Marker({
          position:  new google.maps.LatLng(lat, long),
           icon:'http://earth.google.com/images/kml-icons/track-directional/track-0.png',
          map: map
        });
		count ++;
		}


		//einfach position markieren:  ohne coustom marker
	  
		/*while(count < positionList.length ){  
		  var lat=parseFloat(positionList[count].split(';')[0]).toFixed(7);
		   var long=parseFloat(positionList[count].split(';')[1]).toFixed(7);
		 var marker = new google.maps.Marker({
          position:  new google.maps.LatLng(lat, long),
          map: map
        });
		count ++;
		}*/

      
	  
	  


      }


	   
