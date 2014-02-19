$(function(){
	$("#send").on('click', function(){
		numbers = [];
		highest = null;
		lowest = null;
		
		socket.emit('in', {min:$("#min").val(), max:$("#max").val()});
		return false;
	});
});

var socket = io.connect("http://localhost:3000/");
var numbers = [];
var highest = null;
var lowest = null;

socket.on('out', function(data){
	numbers.push(data);
	if (highest == null || data > highest) {
		highest = data;
		$(".max").text(data);
	}
	
	if (lowest == null || data < lowest) {
		lowest = data;
		$(".min").text(data);
	}
	
	$(".avg").text(avrage(numbers));
});

function avrage(numberz) {
	var sum = 0;
	var i = 0;
	for (i in numberz) {
		sum += numberz[i];
	}
	
	i++;
	return (sum/i);
}