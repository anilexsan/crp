var HTML = document.documentElement.innerHTML;

//function que pega algo dentro dentro do html.
function pegaString(str, first_character, last_character) {
	if(str.match(first_character + "(.*)" + last_character) == null){
		return null;
	}else{
	    new_str = str.match(first_character + "(.*)" + last_character)[1].trim()
	    return(new_str)
    }
}
//function que mudar o player para um mais simples.
function importPlayer(){
		console.log("[CR Premium] Removendo player da Crunchyroll...");
		var elem = document.getElementById('showmedia_video_player');
    	elem.parentNode.removeChild(elem);

		console.log("[CR Premium] Pegando dados da stream...");
		var video_config_media = JSON.parse(pegaString(HTML, "vilos.config.media = ", ";"));

    	console.log("[CR Premium] Adicionando o jwplayer...");
    	ifrm = document.createElement("iframe");
    	ifrm.setAttribute("id", "frame"); 
		ifrm.setAttribute("src", "https://anilexsan.github.io/crp/index.html"); 
		ifrm.setAttribute("width","100%");
		ifrm.setAttribute("height","100%");
		ifrm.setAttribute("frameborder","0");
		ifrm.setAttribute("scrolling","no");
		ifrm.setAttribute("allowfullscreen","allowfullscreen");		
		ifrm.setAttribute("allow","autoplay; encrypted-media *");
	
		if(document.body.querySelector("#showmedia_video_box") != null){
			document.body.querySelector("#showmedia_video_box").appendChild(ifrm);
		}else{
			document.body.querySelector("#showmedia_video_box_wide").appendChild(ifrm);
		}

		//Remove Nota do topo sobre experimentar o premium
		if (document.body.querySelector(".freetrial-note") != null) {
			console.log("[CR Premium] Removendo Free Trial Note...");
			document.body.querySelector(".freetrial-note").style.display = "none";
		}

		//Remove avisos q o video nn pode ser visto
		if(document.body.querySelector(".showmedia-trailer-notice") != null){
			console.log("[CR Premium] Removendo Trailer Notice...");
			document.body.querySelector(".showmedia-trailer-notice").style.display = "none";
			document.body.querySelector(".message-container").style.display = "none";
		}

		//Remove sugestão de inscrever-se para o trial gratuito
		if(document.body.querySelector("#showmedia_free_trial_signup") != null){
			console.log("[CR Premium] Removendo Free Trial Signup...");
			document.body.querySelector("#showmedia_free_trial_signup").style.display = "none";
		
		}

		if(document.body.querySelector("#sidebar") != null){
			document.body.querySelector("#sidebar").classList = "none";
			document.body.querySelector("#sidebar").style.width = "100vh";
			document.body.querySelector("#template_container").style.width = "60vw";
			document.body.querySelector("#main_content").classList = "none";
			document.body.querySelector("#main_content").style.width = "60vw";
			document.body.querySelector("#showmedia_video_box").style.width = "60vw";
			document.body.querySelector("#showmedia_video_box").style.height = "calc(60vw * 9 / 16)";
	
		}

		ifrm.onload = function(){
			ifrm.contentWindow.postMessage({
           		'video_config_media': [JSON.stringify(video_config_media)],
           		'lang': [pegaString(HTML, 'LOCALE = "', '",')]
        	},"*");
	    };

		//console.log(video_config_media);
}
function importAds(){

	uuid = Math.random().toString(36).slice(2);

	temp = document.createElement('div');
	temp.innerHTML = '<a href="https://anilex.tk/" id="' + uuid + '" class="' + uuid + '" target="_blank"><img src="https://i.imgur.com/LMJM9lo.png" style="display: block; margin-left: auto; margin-right: auto; width:100%; max-width:1227px; border: 0px solid #555;" center></a>';

	if(document.body.querySelector(".showmedia-header") != null){
	document.body.querySelector(".showmedia-header").appendChild(temp);	
	}
	if(document.body.querySelector(".season") != null){
		document.body.querySelector(".season").appendChild(temp);		
	}
	if(document.body.querySelector("#showview-content-header") != null){
		document.body.querySelector("#showview-content-header").appendChild(temp);		
	}
	if(document.body.querySelector("#template_skin_leaderboard") != null){
		document.body.querySelector("#template_skin_leaderboard").appendChild(temp);		
	}
	if(document.body.querySelector(".instagram-container") != null){
		document.body.querySelector(".instagram-container").appendChild(temp);		
	}
	if(document.body.querySelector(".login-messages") != null){
		document.body.querySelector(".login-messages").appendChild(tem);		
	}
	
}
//function ao carregar pagina.
function onloadfunction() {

	if(pegaString(HTML, "vilos.config.media = ", ";") != null){
		importPlayer();
		importAds()
	} else {
		importAds()	
	}
}

document.addEventListener("DOMContentLoaded", onloadfunction());