window.addEventListener("message", function (e) {

	//console.log(e);
	//console.log(e.currentTarget.document.referrer);

	var video_config_media = JSON.parse(e.data.video_config_media);
	var user_lang = e.data.lang;
	var video_stream_url = "";
	var video_id = video_config_media['metadata']['id'];
	var rows_number = 0;
	var video_m3u8_array = [];
	var video_m3u8 = "";
	var episode_title = "";
	var episode_translate = "";
	var series_title = "";
	var series_url = e.currentTarget.document.referrer;
	var is_ep_premium_only = null;
	var video_dash_playlist_url_only_trailer = "";
	var video_dash_playlist_url_old = "";
	var video_dash_playlist_url = "";

	if (user_lang == "enUS") {
		var series_rss = "https://www.crunchyroll.com/" + series_url.split("/")[3] + ".rss";
	} else {
		var series_rss = "https://www.crunchyroll.com/" + series_url.split("/")[4] + ".rss";
	}
	//console.log(video_config_media);

	for (var i = 0; i < video_config_media['streams'].length; i++) {
		if (video_config_media['streams'][i].format == 'trailer_hls' && video_config_media['streams'][i].hardsub_lang == user_lang) {
			is_ep_premium_only = true;
				
			video_m3u8_array.push(video_config_media['streams'][i].url.replace(/mp4.*Policy/, "mp4?Policy").replace(video_config_media['streams'][i].url.split("/")[2], "fy.v.vrv.co"));
			rows_number++;

		}
		if (video_config_media['streams'][i].format == 'adaptive_hls' && video_config_media['streams'][i].hardsub_lang == user_lang) {
			is_ep_premium_only = false;

			video_stream_url = video_config_media['streams'][i].url.replace("fy.v.vrv.co", "pl.crunchyroll.com");

			break;
		}
	}

	//Pega varias informações pela pagina rss.
	$.ajax({
		async: true,
		type: "GET",
		url: "https://api.allorigins.win/raw?url=" + series_rss,
		contentType: "text/xml; charset=utf-8",
		complete: function (response) {

			//Pega o titulo da serie
			series_title = $(response.responseXML).find("image").find("title").text();

			//Pega o numero e titulo do episodio
			switch (user_lang[0]) {
				case ("ptBR"):
					episode_translate = "Episódio ";
					break;
				case ("enUS"):
					episode_translate = "Episode ";
					break;
				case ("enGB"):
					episode_translate = "Episode ";
					break;
				case ("esLA"):
					episode_translate = "Episodio ";
					break;
				case ("esES"):
					episode_translate = "Episodio ";
					break;
				case ("ptPT"):
					episode_translate = "Episódio ";
					break;
				case ("frFR"):
					episode_translate = "Épisode ";
					break;
				case ("deDE"):
					episode_translate = "Folge ";
					break;
				case ("arME"):
					episode_translate = "الحلقة ";
					break;
				case ("itIT"):
					episode_translate = "Episodio ";
					break;
				case ("ruRU"):
					episode_translate = "Серия ";
					break;
				default:
					episode_translate = "Episode ";
			}

			if (video_config_media['metadata']['up_next'] == undefined) {
				episode_title = series_title + ' - ' + episode_translate + video_config_media['metadata']['display_episode_number'];
			} else {
				var prox_ep_number = video_config_media['metadata']['up_next']['display_episode_number'];
				episode_title = video_config_media['metadata']['up_next']['series_title'] + ' - ' + prox_ep_number.replace(/\d+/g, '') + video_config_media['metadata']['display_episode_number'];
			}

			//Inicia o player
			var playerInstance = jwplayer("player_div")
			playerInstance.setup({
				"playlist": [{
					"title": episode_title,
					"description": video_config_media['metadata']['title'],
					"image": video_config_media['thumbnail']['url'],
					"width": "100%",
					"height": "100%",
					"autostart": false,
					"displayPlaybackLabel": true,
					"primary": "html5",
					"sources": [{
						file: video_m3u8_array[1],
						label: "1080p"
			        },{
			            file: video_m3u8_array[0],
						label: "720p"						
			        },{
			            file: video_m3u8_array[2],
						label: "480p"
			        },{
			            file: video_m3u8_array[3],
						label: "360p"
			        },{
			            file: video_m3u8_array[4],
						label: "240p"
			        }]
				  }]
			});
						
			//Variaveis para o botao de baixar.
			var button_iconPath = "assets/icon/download_icon.svg";
			var button_tooltipText = "Baixar Vídeo";
			var buttonId = "download-video-button";
			
			//function que pega algo dentro dentro do html.
			function pegaString(str, first_character, last_character) {
				if(str.match(first_character + "(.*)" + last_character) == null){
					return null;
				}else{
				    new_str = str.match(first_character + "(.*)" + last_character)[1].trim()
				    return(new_str)
			    }
			}
			
			//function que decodifica caracteres html de uma string
			function htmlDecode(input){
			  var e = document.createElement('textarea');
			  e.innerHTML = input;
			  // handle case of empty input
			  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
			}
			
			//function que pega o tamanho de um arquivo pela url
			function setFileSize(url, element_id, needs_proxy) {
				var proxy = "https://cors-anywhere.herokuapp.com/";
				var fileSize = "";
				var http = (window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"));

				if(needs_proxy == true){
					final_url = proxy + url;
				}else{
					final_url = url;
				}

				http.onreadystatechange = function() {
					if (http.readyState == 4 && http.status == 200) { 
						//Pega o tamanho em bytes do arquivo de video
						fileSize = http.getResponseHeader('content-length');

						//Se o fileSize for igual a null é porque precisa de proxy pra pegar o header
						if(fileSize == null) {
							setFileSize(url, element_id, true);
						}else{
							var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
							if (fileSize == 0) return 'n/a';
							var i = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)));
							if (i == 0) return fileSize + ' ' + sizes[i];

							var return_fileSize = (fileSize / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
							document.getElementById(element_id).innerText = return_fileSize;
						}
					}
				}
				http.open("HEAD", final_url, true);
				http.send(null);
			}
			
			//funcion ao clicar no botao de fechar o menu de download
			document.querySelectorAll("button.close-modal")[0].onclick = function(){
				document.querySelectorAll(".modal")[0].style.visibility = "hidden";
			};
			
			//function ao clicar no botao de baixar
			function download_ButtonClickAction() {
				
				//Se estiver no mobile, muda um pouco o design do menu
				if (jwplayer().getEnvironment().OS.mobile == true) {
					document.querySelectorAll(".modal")[0].style.height = "170px";
					document.querySelectorAll(".modal")[0].style.overflow = "auto";
				}
				
				//Mostra o menu de download
				document.querySelectorAll(".modal")[0].style.visibility = "visible";
				
				//Pega a url da playlist atual
				player_current_playlist = jwplayer().getPlaylist()[0].file;
				
				//console.log("Playlist Atual:" + player_current_playlist);
				
				//Verifica se o ep é so pra usuarios premium
				if(jwplayer().getPlaylist()[0].file.indexOf('blob:') !== -1) {
					is_ep_premium_only = true;
				}else{
					is_ep_premium_only = false;
				}
				
				//console.log("is_ep_premium_only: " + is_ep_premium_only);
				
				//Se o episodio não for apenas para premium pega as urls de um jeito mais facil
				if(is_ep_premium_only == false) {
					video_dash_playlist_url_old = player_current_playlist.replace("master.m3u8","manifest.mpd").replace(player_current_playlist.split("/")[2], "fy.v.vrv.co").replace("evs1","evs");
					video_dash_playlist_url = player_current_playlist.replace(player_current_playlist.split("/")[2], "fy.v.vrv.co").replace("evs1", "evs");

					///console.log("Dash Playlist Old: " + video_dash_playlist_url_old);
					//console.log("Dash Playlist: " + video_dash_playlist_url);

					$.ajax({
						async: true,
						type: "GET",
						url: video_dash_playlist_url_old,
						success: function (result,status,xhr) {
							var params_download_link = htmlDecode(pegaString(xhr.responseText, '.m4s?', '"'));
							var video_1080p_code = video_dash_playlist_url.split(",")[2];
							var video_720p_code = video_dash_playlist_url.split(",")[1];
							var video_480p_code = video_dash_playlist_url.split(",")[3];
							var video_360p_code = video_dash_playlist_url.split(",")[4];
							var video_240p_code = video_dash_playlist_url.split(",")[5];

							var video_1080p_mp4_url = video_dash_playlist_url.split("_,")[0] + "_" + video_1080p_code + params_download_link;
							var video_720p_mp4_url = video_dash_playlist_url.split("_,")[0] + "_" + video_720p_code + params_download_link;
							var video_480p_mp4_url = video_dash_playlist_url.split("_,")[0] + "_" + video_480p_code + params_download_link;
							var video_360p_mp4_url = video_dash_playlist_url.split("_,")[0] + "_" + video_360p_code + params_download_link;
							var video_240p_mp4_url = video_dash_playlist_url.split("_,")[0] + "_" + video_240p_code + params_download_link;
							
							document.getElementById("1080p_down_url").href = video_1080p_mp4_url;
							setFileSize(video_1080p_mp4_url, "1080p_down_size");
							document.getElementById("720p_down_url").href = video_720p_mp4_url;
							setFileSize(video_720p_mp4_url, "720p_down_size");
							document.getElementById("480p_down_url").href = video_480p_mp4_url;
							setFileSize(video_480p_mp4_url, "480p_down_size");
							document.getElementById("360p_down_url").href = video_360p_mp4_url;
							setFileSize(video_360p_mp4_url, "360p_down_size");
							document.getElementById("240p_down_url").href = video_240p_mp4_url;
							setFileSize(video_240p_mp4_url, "240p_down_size");
							
							//console.log("1080p_mp4: " + video_1080p_mp4_url);
							//console.log("720p_mp4: " + video_720p_mp4_url);
							//console.log("480p_mp4: " + video_480p_mp4_url);
							//console.log("360p_mp4: " + video_360p_mp4_url);
							//console.log("240p_mp4: " + video_240p_mp4_url);
						}
					});
				}
				
				//Se o episodio for apenas para usuarios premium
				//if(is_ep_premium_only == true) {										

							document.getElementById("1080p_down_url").href = video_m3u8_array[1];
							setFileSize(video_m3u8_array[1], "1080p_down_size");
	
							document.getElementById("720p_down_url").href = video_m3u8_array[0];
							setFileSize(video_m3u8_array[0], "720p_down_size");

							document.getElementById("480p_down_url").href = video_m3u8_array[2];
							setFileSize(video_m3u8_array[2], "480p_down_size");

							document.getElementById("360p_down_url").href = video_m3u8_array[3];
							setFileSize(video_m3u8_array[3], "360p_down_size");

							document.getElementById("240p_down_url").href = video_m3u8_array[4];
							setFileSize(video_m3u8_array[4], "240p_down_size");
				//}
			}
			
			playerInstance.addButton(button_iconPath, button_tooltipText, download_ButtonClickAction, buttonId);

			//Funções para o player
			jwplayer().on('ready', function (e) {
				//Seta o tempo do video pro salvo no localStorage		
				if (localStorage.getItem(video_id) != null) {
					document.getElementsByTagName("video")[0].currentTime = localStorage.getItem(video_id);
				}
				document.body.querySelector(".loading_container").style.display = "none";
			});
			//Mostra uma tela de erro caso a legenda pedida não exista.
			jwplayer().on('error', function (e) {
				if (e.code == 232011) {
					jwplayer().load({
						file: "https://i.imgur.com/jrkkCU1.mp4"
					});
					jwplayer().setControls(true);
					jwplayer().setConfig({
						repeat: true
					});
					jwplayer().play();
				}
				if (e.code == 232600) {

					jwplayer().setControls(true);					

				}
			});
			//Fica salvando o tempo do video a cada 5 segundos.
			const save_player_time_interval = setInterval(function () {
				if (jwplayer().getState() == "playing") {
					localStorage.setItem(video_id, jwplayer().getPosition());
				}
			}, 5000);
		}
	});
});