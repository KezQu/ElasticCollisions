let xhr;
let sessionToken = undefined; 

function getRequestObject() {
	if ( window.ActiveXObject) {
	return ( new ActiveXObject("Microsoft.XMLHTTP"));
	} else if (window.XMLHttpRequest) {
	return (new XMLHttpRequest());
	} else {
	return (null);
	}
}
function SendRequest(method, uri, mess, load, headerSet){
	xhr = getRequestObject();
	if(xhr){
		xhr.onreadystatechange = load;
		var url = "/";
		xhr.open(method, url + uri, true);
		headerSet(xhr);
    	// xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(mess);
	}
}
function login(){
	let message = {
		username : document.getElementById("username").value,
		password : document.getElementById("password").value
	};
	SendRequest("POST", "login", JSON.stringify(message), () =>{
		AJAXcallback();
		if(xhr.readyState == 4){
			if(xhr.status > 199 && xhr.status < 300){
				sessionToken = JSON.parse(xhr.response).token;
				document.getElementById("session_username").innerHTML = JSON.parse(xhr.response).session;
				document.getElementById("login_btn").style.pointerEvents = 'none';
				document.getElementById("login_btn").style.backgroundColor = "grey";
				document.getElementById("register_btn").style.pointerEvents = 'none';
				document.getElementById("register_btn").style.backgroundColor = "grey";
				
				// document.getElementById("sims_col").style.visibility = "visible";
				document.getElementById("sims_col").style.opacity = 1;
				document.getElementById("save_sim").style.pointerEvents = 'all';
				document.getElementById("save_sim").style.backgroundColor = "#dda15e";
				ListSimulations(JSON.parse(xhr.response).data);
			}
		}
	}, (xhr) => {xhr.setRequestHeader('Content-Type', 'application/json');});
}
function logout(){
	SendRequest("GET", "logout", null, () =>{
		AJAXcallback();
		if(xhr.readyState == 4){
			if(xhr.status > 199 && xhr.status < 300){
				sessionToken = JSON.parse(xhr.response).token;
				document.getElementById("login_btn").style.pointerEvents = 'all';
				document.getElementById("login_btn").style.backgroundColor = "#dda15e";
				document.getElementById("register_btn").style.pointerEvents = 'all';
				document.getElementById("register_btn").style.backgroundColor = "#dda15e";
				
				document.getElementById("sims_col").style.opacity = 0;
				document.getElementById("save_sim").style.pointerEvents = 'none';
				document.getElementById("save_sim").style.backgroundColor = "grey";
			}
		}
	}, (xhr) => {
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader('Authorization', 'Bearer ' + sessionToken);
	});
}
function register(){
	let message = {
		username : document.getElementById("username").value,
		password : document.getElementById("password").value
	};
	SendRequest("POST", "register", JSON.stringify(message), AJAXcallback, (xhr) => {xhr.setRequestHeader('Content-Type', 'application/json');});
}
function DeleteSimulation(name){
	let message ={
		name : name
	}
	SendRequest("POST", "delete", JSON.stringify(message), () => {
		AJAXcallback();
		if(xhr.readyState == 4){
			if(xhr.status > 199 && xhr.status < 300){
				ListSimulations(JSON.parse(xhr.response).data);
			}
		}
	}, (xhr) => {
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader('Authorization', 'Bearer ' + sessionToken);
	})
}
function SaveSimulation(){
	let message = {
		data : ballArray
	}
	SendRequest("POST", "save", JSON.stringify(message), () =>{
		AJAXcallback();
		if(xhr.readyState == 4){
			if(xhr.status > 199 && xhr.status < 300){
				ListSimulations(JSON.parse(xhr.response).data);
			}
		}
	}, (xhr) => {
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader('Authorization', 'Bearer ' + sessionToken);
	});
}
function AJAXcallback(){
	if(xhr.readyState == 4){
		if(xhr.status > 199 && xhr.status < 300){
			document.getElementById("error_box").innerHTML = JSON.parse(xhr.response).message;
			document.getElementById("error_box").style.backgroundColor = "#606c38";
		}
		else if (xhr.status > 399 && xhr.status < 500) {
			document.getElementById("error_box").innerHTML = JSON.parse(xhr.response).message;
			document.getElementById("error_box").style.backgroundColor = "#dd5e5e";
		}
		else{
			document.getElementById("error_box").innerHTML = "Server Error";
			document.getElementById("error_box").style.backgroundColor = "#dd5e5e";
		}
		document.getElementById("error_box").style.transition = 'opacity 0.5s';
		document.getElementById("error_box").style.opacity = 1;
	}
}