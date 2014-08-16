/*
 * A Bitcointalk Extension
 * 
 * Copyright (C) 2014
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: fernarios
 * 
 * 
 * NOTE: This is an unofficial bitcointalk browser extension (for Google
 * Chrome). This project is not related with bitcointalk.org administration.
 * 
 * Help, comments and feedback:
 * 	English Thread: 
 * 	Spanish Thread: https://bitcointalk.org/index.php?topic=708721.0
 * 
*/

var change_style = true;

var username;
var url_vars;
var time_counter = 0;

var max_msg_id = 99999999999;
var days_to_clean_storage = 30;

var symbol_ready = "<b>&#9745;</b>";
var symbol_box = "<b>&#9744;</b>";
var symbol_loading = "<span>&#8635;</span>"
var symbol_reaload = "<span>&#10227;</span>";

var link_color;
var link_ignored_color;
var bg_color;
var font_color;

if(change_style)
{
    link_color = "#476C8E";
    link_ignored_color = "#585858";
    bg_color = "#0A2229";
    font_color = "#B4B4B4";
}
else
{
    link_color = "#476C8E";
    link_ignored_color = "#ACABAD";
    bg_color = "#E5E5E8";
    font_color = "#000000";
}

username = document.getElementById("hellomember");							// Getting user name
if(username != null)
{
    username = document.getElementById("hellomember").innerHTML;
    username = username.substring(username.indexOf("<b>") + 3, username.indexOf("</b>"));
}
else
{
    username = "anonuser";
}

url_vars = window.location.search;									// Reading current url

var url_board_index = url_vars.indexOf("board=");
if(url_board_index >= 0)
{													// Currently in a board page
    var string_end = url_vars.indexOf(".", url_board_index);
    var board_id = url_vars.substring(url_board_index + 6, string_end);
    change_board_page(document, board_id);
    
    insert_footer(document);
    changeStyles(document);										// Changing styles of current page
}

var url_topic_index = url_vars.indexOf("topic=");
if(url_topic_index >= 0)										// Currently in a topic page
{
    var topic_id = url_vars.substring(url_topic_index + 6);
    var string_end = topic_id.indexOf(".");
    topic_id = topic_id.substring(0, string_end);
    change_topic_page(document, topic_id);
    
    insert_footer(document);
    changeStyles(document);										// Changing styles of current page
}

function change_topic_page(doc_element, topic_id)							// Apply extension changes to topic page elements
{
    var element;
    var counter;
    var function_toggle;
    var last_read = 0, new_last_read = 0;
    var str_message, message_id, message_display;
    var topic_id;
    var post_resume, author_name, post_resume_display;
    var post_date, post_buttons, post_element;
    var mark_unread_url;
    
    last_read = local_storage_get_item(username + "_T_" + topic_id + "_LPo");				// Getting last read post
    if(last_read == null)
    {
	last_read = 0;
    }
	    
    element = doc_element.querySelectorAll(".windowbg, .windowbg2");
    
    for(counter = 0; counter < element.length; counter++)						// For each post
    {
	if(element[counter].getElementsByClassName("td_headerandpost")[0] != null)
	{
	    post_element = element[counter];
	    
	    post_element.style.fontWeight = "normal";							// Sometimes font-weight is natively setting "bold" in some parent class (apparently without reason)
	    
	    embed_youtube_links(post_element);								// Youtube embed
	    
	    btc_address_to_link(post_element);									// Bitcoin Address detection and linking to blockchain.info
	    
	    
	    function_toggle = "" +									// Hide post toggle function
		"if(document.getElementById(\"toggleText" + counter +"\").style.display == \"block\")"+
		"{"+
		    "document.getElementById(\"toggleText" + counter + "\").style.display = \"none\";"+
		    "document.getElementById(\"displayText" + counter + "\").style.display = \"block\";"+
		"}else{"+
		    "document.getElementById(\"toggleText" + counter +"\").style.display = \"block\";"+
		    "document.getElementById(\"displayText" + counter +"\").style.display = \"none\";"+
		    ""+
		"}";
	    
	    author_name = post_element.getElementsByClassName("poster_info")[0].textContent.toString();
	    author_name = author_name.substring(1);
	    author_name = author_name.substring(0, author_name.indexOf("\n"));
	    
	    str_message = post_element.getElementsByClassName("message_number")[0].toString();
	    message_id = str_message.substring(str_message.indexOf("#msg") + 4);
	    
	    if(parseInt(message_id) < 1000000000)							// There are some weird hidden post with id over 1400000000 (aparently purposeless)
	    {
		if(parseInt(message_id) <= parseInt(last_read))						// Hiding read post
		{
		    message_display = "none";
		    post_resume_display = "block";
		}
		else
		{
		    message_display = "block";								// Showing unread post
		    post_resume_display = "none";
		    if(new_last_read < parseInt(message_id))
		    {
			new_last_read = parseInt(message_id);
		    }
		}
	    }else{
		element[counter].parentNode.parentNode.parentNode.style.display = "none";		// Hiding weird hidden post
	    }
	    
	    post_resume = "<table width='100%' border = '0'><tr><td><b>" + author_name + "</b>: " +	// Post resume for hiding post div
		post_element.getElementsByClassName("post")[0].textContent.toString();
	    
	    if(post_resume.length > 195){
		post_resume = post_resume.substring(0,190);
		post_resume = post_resume + "<b>(...)</b></td>";
	    }
	    
	    post_date = post_element.getElementsByClassName("td_headerandpost")[0];			// Getting post date for resume
	    post_date = post_date.getElementsByClassName("smalltext")[0].textContent.toString();
	    post_date = "<td align='right'>" + post_date + "</td></tr></table>";
	    post_resume = post_resume + post_date;							// Inserting post date in resume
	    
	    post_element.innerHTML = "<div id='displayText" + counter + "' onclick='" + function_toggle +
		"' style='display: " + post_resume_display + "'>" + post_resume + "</div><div id='toggleText" + counter +
		"' style='display: " + message_display + "'>" + post_element.innerHTML + "</div>";
	    
	    mark_unread_url = doc_element.getElementsByClassName("mirrortab_back")[0];			// Getting mark unread native url
	    mark_unread_url = get_element_with_string_in_attribute(mark_unread_url, "tag", "a", "?action=markasread;", "href", 0);
	    mark_unread_url = mark_unread_url.href;
	    
	    
	    fuction_mark_unread = "" +									 // "mark unread" post function
		"localStorage.setItem(\"" + username + "_T_" + topic_id + "_LPo" + "\", parseInt(" + message_id + ")-1);" +
		"document.getElementById(\"button_mark_unread_" + message_id +"\").innerHTML = \"| " +
		"<b style=\\\"cursor:pointer;\\\">" + symbol_loading + " marking unread...</b>" + 
		"<div class=\\\"mark_unread_loading_mark_text\\\" style=\\\"display: none;\\\">" + message_id + "</div>" +
		"<div id=\\\"mark_unread_loading_mark_url_" + message_id + "\\\" style=\\\"display: none;\\\">" + mark_unread_url + "</div>" +
		"\";";
	    
	    post_buttons = post_element.getElementsByClassName("td_buttons")[0];			// Inserting "hide" and "mark unread" post buttons
	    post_buttons.innerHTML = "<table align='right' border='0'><tr>" +
		"<td style='white-space: nowrap'><div id='button_mark_unread_" + message_id + "' onclick='" + fuction_mark_unread + "'>" +
		"| <b style=\"cursor:pointer;\">&#8224; mark unread</b></div></td>" +
		"<td style='white-space: nowrap'> | </td>" +
		"<td style='white-space: nowrap'><div onclick='" + function_toggle + "'>" +
		"<b style=\"cursor:pointer;\">&#8225; hide |</div></b></td>" +
		"<td align='right' style='white-space: nowrap'>" + post_buttons.innerHTML + "</td></tr></table>";
	}
    }
    
    if(parseInt(last_read) < new_last_read)
    {
	localStorage.setItem(username + "_T_" + topic_id + "_LPo", new_last_read);			// Setting last read post
    }
}

function embed_youtube_links(element)
{
    var link_elements;
    var counter;
    var string_index, string_content;
    
    link_elements =  element.getElementsByTagName("a");							// Getting <a ...> elements
	    
    counter = 0;
    while(link_elements[counter] != null)								// For each link
    {
	string_index = -1;
	
	string_index = link_elements[counter].href.indexOf("youtube.com/watch");			// Searching youtube.com in href
	if(string_index >= 0)
	{
	    string_index = string_index + 17;
	    string_index = link_elements[counter].href.indexOf("v=", string_index);
	    if(string_index > 0)
	    {
		string_index = string_index + 2;
	    }
	    else
	    {
		string_index = -1;
	    }
	}
	
	if(string_index < 0)
	{
	    string_index = link_elements[counter].href.indexOf("youtu.be/");				// Searching youtu.be in href
	    if(string_index >= 0)
	    {
		string_index = string_index + 9;
	    }
	}
	
	if(string_index >= 0)										// Youtube link found
	{
	    string_content = link_elements[counter].href.substring(string_index);
	    
	    string_content = "<br><embed width='640' height='360' " +					// iframe embed element
		"src='https://www.youtube.com/v/" + string_content +
		"' type=\"application/x-shockwave-flash\"></iframe><br>";
		
	    link_elements[counter].outerHTML += string_content;						// Inserting iframe string
	}
	
	counter++;
    }
}

function btc_address_to_link(element)
{
    var string_index, string_content;
    var regex = /[^a-zA-Z0-9]/;
    var patt = new RegExp(regex);
    var a_index_array = [];
    var i;
    var string_index2, string_index3, string_length;
    
    searchLinks(element, a_index_array);								// Reading positions of all links (content between <a  and </a>)
    
    string_index = element.innerHTML.indexOf("1");							// Searfching for next address candidate (starts with 1 or 3)
    string_index3 = element.innerHTML.indexOf("3");
    if(string_index3 < string_index){
	string_index = string_index3;
    }
    
    while(string_index >= 0){
	string_content = element.innerHTML.substring(string_index, string_index + 27);			// Getting 27 character of address candidate
	if (!patt.test(string_content))									// Proving pattern (alphanumeric characters only) in address candidate
	{
	    for(i = 28; i <= 34; i++)									// Searching address candidate end
	    {
		string_content = element.innerHTML.substring(string_index, string_index + i);
		if (patt.test(string_content))
		{
		    break;
		}
	    }
	    string_length = i - 1;
	    string_content = element.innerHTML.substring(string_index, string_index + string_length)
	    
	    if(!between(string_index, a_index_array))							// Proving that address is not part of a link
	    {
		string_content = "<a href='https://blockchain.info/address/" + string_content +		// Inserting link code
		    "' target='_blank'>" + string_content + "</a>";
		    
		insert_string_code(element, string_content, string_index, string_index + string_length);
		
		searchLinks(element, a_index_array);
	    }
	    
	    
	}
	else
	{
	    string_content = "N";
	}
	
	string_index2 = element.innerHTML.indexOf("1", string_index + string_content.length);		// Searfching for next address candidate
	string_index3 = element.innerHTML.indexOf("3", string_index + string_content.length);
	if(string_index3 > 0 && (string_index3 < string_index2 || string_index2 < 0))
	{
	    string_index2 = string_index3;
	}
	if(string_index2 > string_index)
	{
	    string_index = string_index2;
	}
	else
	{
	    string_index = -1;
	}
    }
}

function change_board_page(doc_element, board_id)
{
    var child_board_table;
    var topics_table;
													// Getting child boards table and topics table
    child_boards_table = get_element_with_string_in_attribute(doc_element, "tag", "table", ">Child Boards</td>", "innerHTML", 0);
    topics_table = get_topics_table(doc_element);
    
    if(child_boards_table != null)
    {
	change_child_boards_table(child_boards_table);							// Changing child boards table
    }
    
    if(topics_table != null)
    {
	change_topics_table(topics_table, board_id);							// Changing topics table
    }
}

function get_topics_table(doc_element)
{
    var topics_table;
    
    topics_table = get_element_with_string_in_attribute(doc_element, "tag", "table", ">Subject</a>", "innerHTML", 0);
    
    return(topics_table);
}

function click_body(e)
{
    var topic_id;
    
    topic_id = local_storage_get_item("overlay_topic_id");
    
    if(e.currentTarget.id != "overlay_topic" && topic_id != "0")					// Closing overlay when click out of overlay div
    {
	document.getElementById("overlay_topic").innerHTML = "";
	document.getElementById("overlay_topic").style.display = "none";
	document.getElementsByTagName("body")[0].style.overflowY = "scroll";
	document.getElementById("bodyarea").style.opacity = "1";
	
	var span_id = document.getElementById("span_topic_link_" + topic_id);
	if(span_id != null)
	{
	    span_id.outerHTML += "<span class=\"proveme_totally_read\" style=\"display:none\">" + topic_id + "</span>";
	}
	
	localStorage.setItem("overlay_topic_id", "0");
    }
    
    e.stopPropagation();
}


function change_page_and_insert_overlay_topic(doc_element, topic_id)					// Insert overlay topic div container
{
    var string_code, string_code2;
    var overlay_topic;
    var body_element;
    var element;
    var counter;
    var td_elements;
    var parent_body = document.getElementsByTagName("body")[0];
    var footerarea_element = document.getElementById("footerarea");
    
    parent_body.style.overflowY = "hidden";								// Prevent scrolling while reading overlay page
	if(document.getElementById("overlay_topic") == null){
	    string_code = "<div id=\"overlay_topic\" tabindex=\"0\" style=\"border:3px solid;" +		// Inserting overlay div
		"border-color:#FFFFFF; position:fixed; display:none;\"></div>";
	    
	    footerarea_element.outerHTML += string_code;
	}
    
    overlay_topic_div = document.getElementById("overlay_topic");
    
    if(overlay_topic_div != null)
    {
	parent_body.addEventListener("click", click_body, false);
	overlay_topic_div.addEventListener("click", click_body, false);
	
	insert_footer(doc_element);
	changeStyles(doc_element);
	body_element = doc_element.getElementsByTagName("body")[0];
	overlay_topic_div.style.backgroundColor = bg_color;						// Style settings for overlay topic
	overlay_topic_div.style.marginLeft = "10px";
	overlay_topic_div.style.marginRight = "10px";
	overlay_topic_div.style.paddingLeft = "30px";
	overlay_topic_div.style.paddingRight = "30px";
	overlay_topic_div.style.paddingTop = "30px";
	//overlay_topic_div.style.paddingBottom = "30px";
	overlay_topic_div.style.top = "10px";
	overlay_topic_div.style.left = "0px";
	overlay_topic_div.style.maxHeight= "95%";
	overlay_topic_div.style.overflowY = "scroll";
	
	var parent_bodyarea = document.getElementById("bodyarea");
	parent_bodyarea.style.opacity = "0.3";
	
	try{
	    body_element.getElementsByClassName("tborder")[0].style.display = "none";			// Removing user panel header
	    element = get_element_with_string_in_attribute(body_element, "tag", "table", ">Home</a>", "innerHTML", 0);
	    element.style.display = "none";								// Removing navigation menu
	    
	    element = get_element_with_string_in_attribute(body_element, "class", "nav", "« previous topic", "textContent", 0);
	    element.parentNode.removeChild(element);							// Removing topic navigation links (top)
	    element = get_element_with_string_in_attribute(body_element, "class", "nav", "« previous topic", "textContent", 0);
	    element.parentNode.removeChild(element);							// Removing topic navigation links (bottom)
	    element = get_element_with_string_in_attribute(body_element, "class", "nav", "href=\"https://bitcointalk.org/index.php\"", "innerHTML", 0);
	    element.parentNode.removeChild(element);							//  Removing board navigation links (top)
	    element = get_element_with_string_in_attribute(body_element, "class", "nav", "href=\"https://bitcointalk.org/index.php\"", "innerHTML", 0);
	    element.parentNode.removeChild(element);							// Removing board navigation links (bottom)
	    
	    element = get_element_with_string_in_attribute(body_element, "class", "tborder", "<select name=\"jumpto\" id=\"jumpto\"", "innerHTML", 0);
	    element.style.display = "none";								// Removing "Jump to" panel
	}catch(e){}  
	
	close_overlay_function = "" +									// Inserting close overlay buttons
	    "document.getElementById(\"overlay_topic\").innerHTML = \"\";" +
	    "document.getElementById(\"overlay_topic\").style.display = \"none\";" +
	    "document.getElementsByTagName(\"body\")[0].style.overflowY = \"scroll\";" +
	    "document.getElementById(\"bodyarea\").style.opacity = \"1\";" +
	    "var span_id = document.getElementById(\"span_topic_link_" + topic_id + "\");" +
	    "span_id.outerHTML += \"<span class=\\\"proveme_totally_read\\\" style=\\\"display:none\\\">" + topic_id + "</span>\"; " +
	    "localStorage.setItem(\"overlay_topic_id\", \"0\")";
	
	var string_code1 = "<span align=\"center\" style=\"color:#996633; background-color:white; ";
	var string_code2 = "onclick='" + close_overlay_function + "'><b>";
	var string_code3 = "</b></span>";
	
	element = get_element_with_string_in_attribute(body_element, "class", "middletext", "Pages:", "textContent", 0);
	
	var close_button_tex = "&nbsp;[&#10005; close]&nbsp;";
	
	string_code = string_code1 + "position:absolute; left:50%; top:20px;" +				// Inserting close overlay button at top
	    "cursor:pointer;\" " + string_code2 + close_button_tex + string_code3;
	insert_string_code(element, string_code, 0, 0);
	string_code = string_code1 + "position:fixed; right:42px; top:20px;" +				// Inserting close overlay button at corner
	    "cursor:pointer;\" " + string_code2 + close_button_tex + string_code3;
	insert_string_code(element, string_code, 0, 0);
	
	var function_page = "this.innerHTML = \"[" + symbol_loading + "]<div class=\\\"mark_read_span_loading_mark_text\\\" " +
	    "style=\\\"display: none;\\\">";
	convert_link_tag_to_span_onclik(element, function_page, "</div>\";", 1000);			// Changing page links
	
	element = get_element_with_string_in_attribute(body_element, "class", "middletext", "Pages:", "textContent", 1);
	
	string_code = string_code1 + "position:absolute; left:50%; margin-top:30px;" +			// Inserting close overlay button at bottom
	    "cursor:pointer;\" " + string_code2 + close_button_tex + string_code3;
	insert_string_code(element, string_code, 0, 0);
	
	convert_link_tag_to_span_onclik(element, function_page, "</div>\";", 1000);			// Changing page links
	
	element = body_element.getElementsByTagName("a");
	counter = 0;
	while(element[counter] != null)
	{												// Setting target = "_blank" for all lnks
	    element[counter].target = "_blank";
	    counter++;
	}
	
	overlay_topic_div.innerHTML = body_element.innerHTML;
	overlay_topic_div.style.display = "";
	overlay_topic_div.focus();
	localStorage.setItem("overlay_topic_id", topic_id);
    }
}

function convert_link_tag_to_span_onclik(element, onclick_function_1, onclick_function_2, limit)
{
    var counter;
    var a_elements;
    var a_href, a_innerHTML, a_class;
    var string_content;
    var span_link_color = link_color;
    var limit_counter;
    var counter2;
    var a_parent_class, a_parent; 
    var string_index;
    var topic_target_page, topic_id;
    
    a_elements = element.getElementsByTagName("a");							// Getting all <a ...> elements
    
    counter = 0;
    limit_counter = 0;
    while(a_elements[counter] != null){									// for each link in element
	a_href = a_elements[counter].href;
	a_class = a_elements[counter].className;
	a_parent = a_elements[counter].parentNode;
	a_parent_class = a_parent.className;
	counter2 = 0;
	while(counter2 <= 5)										// Searching for class "ignored_topic"
	{
	    if(a_parent_class.indexOf("ignored_topic") >= 0){
		span_link_color = link_ignored_color;							// Setting color of ignored_topic
		break;
	    }
	    a_parent = a_parent.parentNode;
	    a_parent_class = a_parent.className;
	    counter2++;
	}
	
	if(a_class.length > 0){										// Setting class for new span
	    a_class = "class=\"" + a_class + "\"";
	}
	
	a_innerHTML = a_elements[counter].innerHTML;							// ontent of link as content of new span
	
	string_index = a_href.indexOf("?topic=") + 7;							// Getting topic target (topic_id and message)
	topic_target_page = a_href.substring(string_index);
	topic_id = a_href.substring(string_index, a_href.indexOf(".", string_index));			// Getting topic id
	string_content = "<span id=\"span_topic_link_" + topic_id + "\" " + a_class +			// Span content (topic_id bettween onclick_function_1 and onclick_function_2)
	    " onclick='" + onclick_function_1 + topic_target_page + onclick_function_2 + "' " +
	    "style=\"cursor:pointer;color:" + span_link_color + ";\">" + a_innerHTML + "</span>";
	
	a_elements[counter].outerHTML = a_elements[counter].outerHTML + string_content;			// Inserting new span
	a_elements[counter].style.display = "none";							// Hidding original link

	counter++;
	
	limit_counter++;
	if(limit_counter >= limit){
	    break;
	}
    }
}

function get_element_with_string_in_attribute(doc_element, element_type, element_type_text, match_text, attribute, index)
{													// Return found element number 'index', search given match_text in attribute of elements with given element_type_text as element_type
    var elements;
    var counter;
    var index_counter;
    
    if(element_type == "tag"){
	elements = doc_element.getElementsByTagName(element_type_text);					// Getting element by tag name
    }else if(element_type == "class"){
	elements = doc_element.getElementsByClassName(element_type_text);				// Getting element by class name
    }else{
	return(null);
    }
    
    counter = 0;
    index_counter = 0;
    while(elements[counter] != null)									// For each element
    {
	if(attribute == "innerHTML"){
	    if(elements[counter].innerHTML.indexOf(match_text) >= 0){					// Searching in .innerHTML attribute
		if(index_counter >= index){
		    return(elements[counter]);
		}
		index_counter++;
	    }
	}else if(attribute == "href"){
	    if(elements[counter].href.indexOf(match_text) >= 0){					// Searching in .href attribute
		if(index_counter >= index){
		    return(elements[counter]);
		}
		index_counter++;
	    }
	}else if(attribute == "className"){
	    if(elements[counter].className.indexOf(match_text) >= 0){					// Searching in .href attribute
		if(index_counter >= index){
		    return(elements[counter]);
		}
		index_counter++;
	    }
	}else if(attribute == "id"){
	    if(elements[counter].id.indexOf(match_text) >= 0){						// Searching in .href attribute
		if(index_counter >= index){
		    return(elements[counter]);
		}
		index_counter++;
	    }
	}else if(attribute == "textContent"){
	    if(elements[counter].textContent.indexOf(match_text) >= 0){					// Searching in .textContent attribute
		if(index_counter >= index){
		    return(elements[counter]);
		}
		index_counter++;
	    }
	}
	counter++;
    }
    
    return(null);
}

function change_child_boards_table(table_element)
{
    var counter;
    var tr_elements, td_elements;
    var string_index, string_index2;
    var cascade_text;
    var function_toggle;
    var cascade;
    var string_code;
    
    table_element.id = "board_child_table";
    tr_elements = table_element.getElementsByTagName("tr");
    
    counter = 0;
    while(tr_elements[counter] != null)									// For each child board in table
    {
	td_elements = tr_elements[counter].getElementsByTagName("td");
	
	string_index = td_elements[0].innerHTML.indexOf("?action=unread;board=")			// Getting Child Board id
	if(string_index > 0){
	    if(td_elements[3] != null){
		string_index = string_index + 21;
		string_index2 = td_elements[0].innerHTML.indexOf(".", string_index);
		var board_id = td_elements[0].innerHTML.substring(string_index, string_index2);
		
		cascade = local_storage_get_item(username + "_B_" + board_id + "_CBo");			// Reading cascade state
		if(cascade != "true"){
		    cascade_text = "<span style=\"cursor:pointer;\">" + symbol_box + "<b> cascade</b></span>";
		}else{
		    cascade_text = symbol_loading + "<b> cascade</b><div class=\"cascade_loading_mark_text\" style=\"display: none;\">" + board_id + "</div>";
		}
		
		function_toggle = "" +									// Toggle view cascade content function
		    "if(localStorage.getItem(\"" + username + "_B_" + board_id + "_CBo" + "\") != \"true\"){" +
			"localStorage.setItem(\"" + username + "_B_" + board_id + "_CBo" + "\", \"true\");" +
			"document.getElementById(\"cascade_" + board_id + "\").innerHTML = \"" + symbol_loading + 
			    "<b> cascade</b><div class=\\\"cascade_loading_mark_text\\\" style=\\\"display: none;\\\">" + board_id + "</div>" + "\";" +
		    "}else{" +
			"localStorage.setItem(\"" + username + "_B_" + board_id + "_CBo" + "\", \"false\");" +
			"document.getElementById(\"cascade_" + board_id + "\").innerHTML = \"<span style=\\\"cursor:pointer;\\\">" + symbol_box + "<b> cascade</b></span>\";" +
			"try{" +									// Removing child board
			    "document.getElementById(\"child_board_" + board_id + "\").innerHTML = \"\";" +
			    "var row1 = document.getElementById(\"child_board_tr_" + board_id + "_1\");" +
			    "var row2 = document.getElementById(\"child_board_tr_" + board_id + "_2\");" +
			    "row1.parentNode.removeChild(row1);" +
			    "row2.parentNode.removeChild(row2);" +
			"}catch(err){}" +
		    "}";
													// Inserting Cascade Button
		string_code = "<div id=\"cascade_" + board_id + "\" onclick='" + function_toggle + "'>" + cascade_text + "</div>";
		string_code = "<tbody><tr><td>" + td_elements[3].innerHTML + "</td><td align='right'>" + string_code + "</td></tr></tbody>";
		string_code = "<table margin='0' border='0' padding='0' width='100%'>" + string_code + "</table>";
		
		insert_string_code(td_elements[3], string_code, 0, td_elements[3].innerHTML.length);
	    }
	}
	
	counter++;
    }
}

function change_topics_table(table_element, board_id)
{
    var counter;
    var tr_elements, td_elements;
    var string_index, string_index2, string_index3;
    var topic_id;
    var last_read;
    var new_last_read;
    var unread_only_symbol;
    var unread_only_button_code;
    var topics_type;
    var reload_table_button;
    
    table_element.id = "topics_table_" + board_id;
    
    tr_elements = table_element.getElementsByTagName("tr");
    
    topics_type = local_storage_get_item(username + "_B_" + board_id + "_UnO");				// Reading unread only state
    if(topics_type == null){
	localStorage.setItem(username + "_B_" + board_id + "_UnO", "unread");				// Setting default value ("unread")
	topics_type = "unread";
    }

    counter = 0;
    while(tr_elements[counter] != null)									// For each topic in table
    {
	td_elements = tr_elements[counter].getElementsByTagName("td");
	
	if(counter == 0){										// Getting "unread only" state
	    if(topics_type == "unread"){
		unread_only_symbol = symbol_ready;
	    }else{
		unread_only_symbol = symbol_box;
	    }
	    
	    function_unread_only_toggle = "" +								// Toggle unread only function
		"document.getElementById(\"unread_only_button_" + board_id + "\").innerHTML = " + 
		"\"<center><b><span id=\\\"unread_only_symbol_" + board_id + "\\\">" + symbol_loading + "</span> unread only</b></center>" +
		"<div class=\\\"unread_only_button_loading_mark_text\\\" style=\\\"display: none;\\\">" + board_id + "</div>\";";
	    
	    unread_only_button_code = "";								// Inserting unread only button
	    unread_only_button_code += "<span id=\"unread_only_button_" + board_id +
		"\" style=\"color:#FFFFFF;cursor:pointer;\" onclick='" + function_unread_only_toggle + "'>" +
		"<b><span id=\"unread_only_symbol_" + board_id + "\">" + unread_only_symbol + "</span> unread only</b></span>";
	    if(topics_type == "unread"){
		unread_only_button_code += "<span id=\"unread_only_state_" + board_id + "\" " +
		"style=\"display: none;\">true</span>";
	    }else{
		unread_only_button_code += "<span id=\"unread_only_state_" + board_id + "\" " +
		"style=\"display: none;\">false</span>";
	    }
	    
	    td_elements[0].innerHTML = unread_only_button_code;
	    
	    td_elements[0].colSpan = "1";
	    td_elements[0].style.minWidth = "5%";
	    td_elements[0].style.whiteSpace = "nowrap";
	    td_elements[0].width = "";
	    
	    function_reload_table = "this.innerHTML = \"<center><span style=\\\"cursor:pointer; color:#FFFFFF;\\\"" +
		" >" + symbol_loading + " <b>reloading...</b></span></center><span class=\\\"reload_table\\\" " +
		"style=\\\"display:none;\\\">" + board_id + "</span>\";";
	    reload_table_button = "<center><span style=\"cursor:pointer; color:#FFFFFF;\" onclick='" + function_reload_table +
		"'>" + symbol_reaload + " <b>reload</b></span></center>";
	    
	    td_elements[0].outerHTML += "<td colspan=\"1\" class=\"catbg3\" style=\"min-width:5%;white-space:nowrap;\">" + reload_table_button + "</td>";
	}
	
	string_index = td_elements[2].innerHTML.indexOf("?topic=");					// Getting topic_id
	if(string_index > 0){
	    string_index2 = td_elements[2].innerHTML.indexOf(".", string_index + 7);
	    topic_id = td_elements[2].innerHTML.substring(string_index + 7, string_index2);
	    
	    search_string = "?topic=" + topic_id + ".msg";
	    string_index = td_elements[2].innerHTML.indexOf(search_string, string_index2);		// Getting new post id from "new" image link (if exist)
	    if(string_index > 0){
		string_index3 = td_elements[2].innerHTML.indexOf("#new", string_index + search_string.length - 1);
		new_last_read = td_elements[2].innerHTML.substring(string_index + search_string.length, string_index3);
		
		insert_mark_read_button(td_elements[2], topic_id, board_id)				// Inserting mark read button
	    }else{											// No "new" image
		if(!totally_read(tr_elements[counter])){
		    insert_unread_post_massage(td_elements[2], topic_id);
		    insert_mark_read_button(td_elements[2], topic_id, board_id)				// Inserting mark read button
		}
		
		string_index = td_elements[6].innerHTML.indexOf(search_string);				// Getting new post id from "last post" image link
		if(string_index > 0){
		    string_index3 = td_elements[6].innerHTML.indexOf("#new", string_index + search_string.length - 1);
		    new_last_read = td_elements[6].innerHTML.substring(string_index + search_string.length, string_index3);
		}else{
		    new_last_read = "0";
		}
		
	    }
	    
	    last_read = local_storage_get_item(username + "_T_" + topic_id + "_LPo");
	    if(last_read == null)									// Save native last post id as extension last read
	    {
		localStorage.setItem(username + "_T_" + topic_id + "_LPo", new_last_read);
		last_read = new_last_read;
	    }
	    
	    insert_string_code(td_elements[2], "msg"+last_read, string_index2 + 1, string_index2 + 2);	// Change topic link to a span with onclick target to last read post
	    var function_page = "this.innerHTML = \"<span id=\\\"mark_read_span_" + topic_id +"\\\">" + symbol_loading + 
		"</span>\" + this.innerHTML + \"<div class=\\\"mark_read_span_loading_mark_text\\\" style=\\\"display: none;\\\">";
	    var function_page_2 = "</div><div id=\\\"mark_read_span_delete_mark_" + topic_id +
		"\\\" style=\\\"display: none;\\\">" + board_id + "</div>\";";
	    convert_link_tag_to_span_onclik(td_elements[2], function_page, function_page_2, 100);
	}
	counter++;
    }
    
    if(topics_type == "unread"){									// Hide read topics
	toggle_hide_read_topics(table_element, board_id, false);
    }
}

function insert_unread_post_massage(td_element, topic_id)
{
    insert_string_code(td_element, "<span id=\"unread_post_message_" + topic_id + "\">(unread post)</span>", td_element.innerHTML.length, td_element.innerHTML.length); 
}

function insert_mark_read_button(td_element, topic_id, board_id)
{
    var function_mark_read;
    var string_code;
    
    function_mark_read = "" + 										// Mark read button function
	"document.getElementById(\"mark_read_span_" + topic_id + "\").innerHTML = \"" + symbol_loading + 
	"<b> marking read...</b>" + "<div class=\\\"mark_read_span_loading_mark_text\\\" " +
	"style=\\\"display: none;\\\">" + topic_id + "</div>" +	"<div id=\\\"mark_read_span_delete_mark_" + topic_id +
	"\\\" style=\\\"display: none;\\\">" + board_id + "</div><div id=\\\"marking_read_no_overlay\\\" style=\\\"display: none;\\\"></div>\";";
	
    string_code = "<span id=\"mark_read_span_" + topic_id + "\" style=\"cursor:pointer;\" onclick='" + function_mark_read + "'> |<b> mark read </b>|&nbsp;</span>";
    
    insert_string_code(td_element, string_code, td_element.innerHTML.length, td_element.innerHTML.length);
}

function toggle_hide_read_topics(table_element, board_id, change)
{
    var tr_elements;
    var counter;
    
    var unread_only_state = document.getElementById("unread_only_state_" + board_id);
    if(unread_only_state == null){
	unread_only_state = "true";
    }else{
	unread_only_state = unread_only_state.textContent;
    }
    if(!change){											// Acting like toggle from contrary state
	if(unread_only_state == "true"){
	    unread_only_state = "false"
	}else{
	    unread_only_state = "true"
	}
    }
    
    tr_elements = table_element.getElementsByTagName("tr");
    
    counter = 0;
    while(tr_elements[counter] != null)									// For each topic in table
    {
	if(unread_only_state == "true"){
	    tr_elements[counter].style.display = "";							// Unhide row table element
	}else{
	    if(totally_read(tr_elements[counter])){							// Hide if topic was read
		tr_elements[counter].style.display="none";						// Hide row table element
	    }else{
		tr_elements[counter].style.display = "";						// Unhide row table element
	    }
	}
	counter++;
    }
    
    if(change){
	if(unread_only_state == "true"){								// Writing toggle preference
	    document.getElementById("unread_only_state_" + board_id).textContent = "false";		// Changing state text
	    document.getElementById("unread_only_symbol_" + board_id).innerHTML = symbol_box;		// Changing symbol
	    localStorage.setItem(username + "_B_" + board_id + "_UnO", "all");				// Save preference in local storage
	}else{
	    document.getElementById("unread_only_state_" + board_id).textContent = "true";
	    document.getElementById("unread_only_symbol_" + board_id).innerHTML = symbol_ready;
	    localStorage.setItem(username + "_B_" + board_id + "_UnO", "unread");
	}
    }
}

function totally_read(tr_element)									// Determine if a topic was already totally read
{
    var string_index, string_index2;
    var td_elements;
    var topic_id;
    var search_string;
    
    td_elements = tr_element.getElementsByTagName("td");
    
    string_index = td_elements[2].innerHTML.indexOf("?topic=");						// Getting topic_id
    if(string_index > 0)
    {
	string_index2 = td_elements[2].innerHTML.indexOf(".", string_index + 7);
	topic_id = td_elements[2].innerHTML.substring(string_index + 7, string_index2);
	
	search_string = "?topic=" + topic_id + ".msg";
	string_index = td_elements[2].innerHTML.indexOf(search_string, string_index2);			// Getting new post id from "new" image link (if exist)
	if(string_index < 0){										// "new" image not found
	    var last_read = local_storage_get_item(username + "_T_" + topic_id + "_LPo");
	    if(last_read == null){
		return(true);
	    }else{
		string_index = td_elements[6].innerHTML.indexOf(search_string);				// Getting last post id
		if(string_index >= 0){
		    string_index2 = td_elements[6].innerHTML.indexOf("#new", string_index);
		    var last_post = td_elements[6].innerHTML.substring(string_index + search_string.length, string_index2);
		    if(parseInt(last_post) > parseInt(last_read)){
			change_span_topic_link(tr_element, topic_id, last_read);
			return(false);
		    }else{
			return(true);
		    }
		}else{
		    return(true);
		}
	    }
	}
    }
}

function change_span_topic_link(tr_element, topic_id, last_read)
{
    var span_element;
    var string_index, string_index2;
    
    span_element = get_element_with_string_in_attribute(tr_element, "tag", "span", "span_topic_link_" + topic_id, "id", 0);
    if(span_element != null)
    {
	string_index = span_element.outerHTML.indexOf(".msg");
	if(string_index >= 0)
	{
	    string_index = string_index + 4;
	    string_index2 = span_element.outerHTML.indexOf("<", string_index);
	    if(string_index2 > string_index)
	    {
		span_element.outerHTML = span_element.outerHTML.substring(0, string_index) + last_read + span_element.outerHTML.substring(string_index2);
	    }
	}
    }
}

function insert_child_board(element, string_index, board_id, get_table)
{
    var child_board_string;
    var xmlhttp=new XMLHttpRequest();
    var child_boards_table_elements;
    var table_element_code;
    var counter = 0;
    var doc_element_code;
													// Table rows and divs for new child board
    child_board_string = "<tr id=child_board_tr_" + board_id + "_1></tr><tr id=child_board_tr_" + board_id + "_2>" +
	"<td></td><td colspan=\"4\"><div id=child_board_" + board_id + "></div></td></tr>";
    
    if(document.getElementById("child_board_" + board_id) == null){
	insert_string_code(element, child_board_string, string_index, string_index);
    }
    
    xmlhttp.onreadystatechange=function(){								// On ready function for child board page
	if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    var doc = document.implementation.createHTMLDocument("example");
	    doc.documentElement.innerHTML = xmlhttp.responseText;					// Convert html code response to HTML DOM element object
	    
	    doc_element_code = "";									// Getting child boards table and topics table
	    var child_boards_table = get_element_with_string_in_attribute(doc, "tag", "table", ">Child Boards</td>", "innerHTML", 0);
	    var topics_table = get_element_with_string_in_attribute(doc, "tag", "table", ">Subject</a>", "innerHTML", 0);
	    
	    if(child_boards_table != null && (get_table == "child_boards" || get_table == "all")){
		change_board_page(child_boards_table.parentNode, board_id);				// Applying extension function for board pages
		changeStyles(child_boards_table);							// Applying extension styles
		doc_element_code += child_boards_table.parentNode.innerHTML;				// Collecting table code
	    }
	    if(topics_table != null && (get_table == "topics" || get_table == "all")){
		change_board_page(topics_table.parentNode, board_id);					// Applying extension function for board pages
		changeStyles(topics_table);								// Applying extension styles
		doc_element_code += topics_table.parentNode.innerHTML;					// Collecting table code
	    }
	    
	    document.getElementById("child_board_" + board_id).innerHTML = doc_element_code;		// Writing child board code
	    document.getElementById("cascade_" + board_id).innerHTML = "<span style=\"cursor:pointer;\">" + symbol_ready + "<b> cascade</b></span>";
	}
    }
    xmlhttp.open("GET","index.php?board=" + board_id + ".0",true);					// Opening child board bage request
    xmlhttp.send();
}

function call_topic_page(topic_id, remove_row, insert_overlay_topic)
{
    var xmlhttp=new XMLHttpRequest();
    
    xmlhttp.onreadystatechange=function()								// On ready function for page
    {
	if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    var doc_element_return = document.implementation.createHTMLDocument("example");
	    doc_element_return.documentElement.innerHTML = xmlhttp.responseText;			// Convert html code response to HTML DOM element object
	    if(topic_id.indexOf(".") >= 0){
		topic_id = topic_id.substring(0, topic_id.indexOf("."));
	    }
	    change_topic_page(doc_element_return, topic_id);
	    
	    if(remove_row != "none")
	    {
		var span_element = document.getElementById("mark_read_span_" + topic_id);
		
		var td_element = span_element.parentNode;
		var counter = 0;
		while(td_element.className.indexOf("windowbg") < 0 && counter < 10){
		    td_element = td_element.parentNode;
		    counter++;
		}
		var tr_element = td_element.parentNode;
		
		span_element.parentNode.removeChild(span_element);					// Removing mark read button span element
		span_element = document.getElementById("mark_read_span_" + topic_id);
		if(span_element != null)
		{
		    span_element.parentNode.removeChild(span_element);
		}
		
		var new_image_element = td_element.getElementsByClassName("newimg");
		if(new_image_element[0] != null)
		{
		    new_image_element[0].parentNode.parentNode.removeChild(new_image_element[0].parentNode);	// Removing new image (link and image) element
		    if(new_image_element[0] != null)
		    {
			new_image_element[0].parentNode.parentNode.removeChild(new_image_element[0].parentNode);// Removing new image (span) element
		    }
		}
		
		var b_index = td_element.innerHTML.indexOf("<b>");
		if(b_index >= 0)
		{
		    insert_string_code(td_element, "", b_index, b_index+3);				// Removing <b> tag
		}
		if(remove_row == "true")
		{											// Hide table row element
		    tr_element.style.display="none";
		}
		var unread_post_message_element = document.getElementById("unread_post_message_" + topic_id)
		if(unread_post_message_element != null)
		{						// Removing "(unread posts)" message
		    unread_post_message_element.parentNode.removeChild(unread_post_message_element);
		}
	    }
	    
	    if(insert_overlay_topic)
	    {
		change_page_and_insert_overlay_topic(doc_element_return, topic_id);
	    }
	}
    }
    
    var topic_url = "index.php?topic=" + topic_id;
    if(!insert_overlay_topic){
	topic_url += ".msg" + max_msg_id;
    }
    
    xmlhttp.open("GET", topic_url, true);								// Opening child board page request
    xmlhttp.send();
}

function call_mark_unread_topic_page(mark_unread_url, message_id, doc_element_return)
{
    var xmlhttp=new XMLHttpRequest();
    
    xmlhttp.onreadystatechange=function(){								// On ready function for page
	if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    doc_element_return = document.implementation.createHTMLDocument("example");
	    doc_element_return.documentElement.innerHTML = xmlhttp.responseText;			// Convert html code response to HTML DOM element object
	    
	    var button_mark_unread_element = document.getElementById("button_mark_unread_" + message_id);
	    button_mark_unread_element.innerHTML = "| <b>" + symbol_ready + " marked unread</b>";	// Changing mark unread button text
	    
	    var onclick_index = button_mark_unread_element.parentNode.innerHTML.indexOf(" onclick=\"");
	    var onclick_end = button_mark_unread_element.parentNode.innerHTML.indexOf(">| <b><b>", onclick_index);
	    if(onclick_index > 0 && onclick_end > onclick_index){
		insert_string_code(button_mark_unread_element.parentNode, "", onclick_index, onclick_end);
	    }
	}
    }
    xmlhttp.open("GET", mark_unread_url, true);								// Opening topic page request
    xmlhttp.send();
}

function call_board_table_on_reload(table_element, board_id)
{
    var xmlhttp=new XMLHttpRequest();
    
    xmlhttp.onreadystatechange=function(){								// On ready function for page
	if (xmlhttp.readyState==4 && xmlhttp.status==200){
	    var doc_element_return = document.implementation.createHTMLDocument("example");
	    doc_element_return.documentElement.innerHTML = xmlhttp.responseText;			// Convert html code response to HTML DOM element object
	    
	    var topics_table = get_topics_table(doc_element_return);
	    
	    if(topics_table != null){
		change_topics_table(topics_table, board_id);						// Changing topics table
		changeStyles(topics_table);
		table_element.outerHTML = topics_table.outerHTML;
	    }
	}
    }
    xmlhttp.open("GET", "index.php?board=" + board_id + ".0", true);					// Opening child board bage request
    xmlhttp.send();
}

function window_timer()
{
    if(url_board_index){
	var loading_elements;
	var counter;
	var board_id, topic_id, topic_id_and_msg_or_page;
	var string_index;
	var table_element;
	
	loading_elements = document.getElementsByClassName("cascade_loading_mark_text");		// Getting cascade buttons in loading state
	counter = 0;
	while(loading_elements[counter] != null)
	{
	    board_id = loading_elements[counter].textContent;
	    loading_elements[counter].className = "loading_page";
	    table_element = document.getElementById("board_child_table");				// Getting child boards table
	    string_index = table_element.innerHTML.indexOf("<div id=\"cascade_" + board_id);
	    string_index = table_element.innerHTML.indexOf("</tr>", string_index) + 5;
	    string_index = table_element.innerHTML.indexOf("</tr>", string_index) + 5;			// End index of table row 
	    
	    insert_child_board(table_element, string_index, board_id, "all");				// Inserting new child board tables at row end
	    counter++;
	}
	
	loading_elements = document.getElementsByClassName("mark_read_span_loading_mark_text");		// Getting mark read buttons in loading state
	counter = 0;
	while(loading_elements[counter] != null)
	{
	    topic_id_and_msg_or_page = loading_elements[counter].textContent;				// Getting topic id
	    loading_elements[counter].parentNode.removeChild(loading_elements[counter]);
	    
	    if(topic_id_and_msg_or_page.indexOf(".") >= 0){
		topic_id = topic_id_and_msg_or_page.substring(0, topic_id_and_msg_or_page.indexOf("."));
	    }else{
		topic_id = topic_id_and_msg_or_page;
	    }
	    
	    var insert_overlay_topic = true;
	    var marking_read_div = document.getElementById("marking_read_no_overlay");
	    if(marking_read_div != null){
		insert_overlay_topic = false;
		marking_read_div.parentNode.removeChild(marking_read_div);
	    }
	    
	    var remove = "false";
	    var board_id_element = document.getElementById("mark_read_span_delete_mark_" + topic_id);
	    if(board_id_element != null){
		board_id = board_id_element.textContent;
		if(local_storage_get_item(username + "_B_" + board_id + "_UnO") == "unread"){
		    remove = "true";
		}
		board_id_element.parentNode.removeChild(board_id_element);
	    }else{
		remove = "none";
	    }
	    
	    call_topic_page(topic_id_and_msg_or_page, remove, insert_overlay_topic);			// Calling topic page
	    //counter++;
	}
	
	loading_elements = document.getElementsByClassName("mark_unread_loading_mark_text");		// Getting mark unread buttons in loading state
	counter = 0;
	while(loading_elements[counter] != null)
	{
	    var doc_element_return;
	    var message_id = loading_elements[counter].textContent;					// Getting message id
	    loading_elements[counter].className = "loading_mark_unread";
	    var mark_unread_url = document.getElementById("mark_unread_loading_mark_url_" + message_id).textContent;
	    if(mark_unread_url != null){								// Calling mark read topic page
		call_mark_unread_topic_page(mark_unread_url, message_id, doc_element_return);
	    }
	    counter++;
	}
	
	loading_elements = document.getElementsByClassName("unread_only_button_loading_mark_text");	// Getting mark unread buttons in loading state
	counter = 0;
	while(loading_elements[counter] != null)
	{
	    board_id = loading_elements[counter].textContent;
	    loading_elements[counter].className = "loading_unread_only";
	    var topics_table = document.getElementById("topics_table_" + board_id);
	    toggle_hide_read_topics(topics_table, board_id, true);
	    counter++;
	}
	
	loading_elements = document.getElementsByClassName("proveme_totally_read");			// Proving totally read topic
	counter = 0;
	while(loading_elements[counter] != null)
	{
	    var topic_id;
	    var counter2;
	    var tr_element, td_element;
	    
	    topic_id = loading_elements[counter].textContent;
	    
	    td_element = loading_elements[counter].parentNode;
	    counter2 = 0;
	    while(td_element.outerHTML.indexOf(" class=\"windowbg") < 0 && counter2 < 5){		// Getting table row element
		td_element = td_element.parentNode;
		counter2++;
	    }
	    
	    tr_element = td_element.parentNode;
	    
	    table_element = tr_element.parentNode;
	    string_index = table_element.outerHTML.indexOf(" id=\"topics_table_");
	    counter2 = 0;
	    while(string_index < 0 && counter2 < 5){							// Getting board id element
		table_element = table_element.parentNode;
		string_index = table_element.outerHTML.indexOf(" id=\"topics_table_");
		counter2++;
	    }
	    if(string_index >= 0){
		board_id = table_element.outerHTML.substring(string_index + 18, table_element.outerHTML.indexOf("\"", string_index + 18));
	    
		if(totally_read(tr_element)){
		    if(local_storage_get_item(username + "_B_" + board_id + "_UnO") == "unread"){
			tr_element.style.display = "none";
		    }
		}else{
		    tr_element.style.display = "";
		    if(document.getElementById("unread_post_message_" + topic_id ) == null){
			insert_unread_post_massage(td_element, topic_id);
		    }
		    insert_mark_read_button(td_element, topic_id, board_id)				// Inserting mark read button
		}
	    }
	    
	    loading_elements[counter].parentNode.removeChild(loading_elements[counter]);
	    //counter++;
	}
	
	loading_elements = document.getElementsByClassName("reload_table");				// Getting mark reload topics table
	counter = 0;
	while(loading_elements[counter] != null)
	{
	    board_id = loading_elements[counter].textContent;
	    table_element = document.getElementById("topics_table_" + board_id);
	    call_board_table_on_reload(table_element, board_id);
	    loading_elements[counter].className = "reloading_table";
	    counter++;
	}
    }
    time_counter++;
    setTimeout(window_timer, 1000);
}

function insert_string_code(element, string_code, replace_index, replace_end){				// Insert any string in element replacing all bettween indexes
    element.innerHTML = element.innerHTML.substring(0, replace_index) +
	string_code + element.innerHTML.substring(replace_end);
}

function printf(string){										// Short function for console log printings debugging
    console.log(string);
}

function between(number, array)										// Determine if a number is bettween limits in array
{
    for(i = 0; i < array.length; i = i + 2){
	if(array[i] != undefined && array[i+1] != undefined){
	    if(number > array[i] && number < array[i+1]){
		return(true);
	    }
	}else{
	    return(false);
	}
    }
    return(false);
}

function searchLinks(element, a_index_array)
{
    var string_index, string_index2, string_index3;
    var a_index_counter;
    
    string_index = element.innerHTML.indexOf("<a ");
    string_index3 = element.innerHTML.indexOf("</a>");
    if(string_index3 < string_index){
	string_index = string_index3;
    }
    
    a_index_counter = 0;
    i =0;
    while(string_index >= 0){
	a_index_array[a_index_counter] = string_index;
	a_index_counter++;
	
	string_index2 = element.innerHTML.indexOf("<a ", string_index + 1);
	string_index3 = element.innerHTML.indexOf("</a>", string_index + 1);
	
	if(string_index3 > 0 && (string_index3 < string_index2 || string_index2 < 0)){
	    string_index2 = string_index3;
	}else{
	}
	if(string_index2 > string_index){
	    string_index = string_index2;
	}else{
	    string_index = -1;
	}
	i++;
    }
}

function changeStyles(doc_element)
{
    var element;
    var counter;
    
    if(change_style == true)
    {
	element = doc_element.getElementsByTagName("tbody");
	counter = 0;
	while(element[counter] != null){
	    element[counter].style.backgroundColor = bg_color;						// Setting tbody background extension color
	    counter++;
	}
	
	element = doc_element.getElementsByTagName("table");
	counter = 0;
	while(element[counter] != null){
	    element[counter].style.borderSpacing = "1px";						// Setting table border extension spacing
	    counter++;
	}
	
	element = doc_element.getElementsByTagName("body");
	counter = 0;
	while(element[counter] != null){
	    element[counter].style.backgroundColor = bg_color;						// Setting body background extension color
	    counter++;
	}
	
	element = doc_element.querySelectorAll(".windowbg, .windowbg2, .windowbg3");
	counter = 0;
	while(element[counter] != null){
	    element[counter].style.backgroundColor = bg_color;						// Setting post background extension color
	    counter++;
	}
	
	element = doc_element.getElementsByTagName("td");
	counter = 0;
	while(element[counter] != null){
	    element[counter].style.backgroundColor = bg_color;						// Setting table td background extension color
	    element[counter].style.color = font_color;							// Setting table td font extension color
	    counter++;
	}
	
	element = doc_element.getElementsByClassName("titlebg2");
	counter = 0;
	while(element[counter] != null){
	    element[counter].style.color = "#000000";							// Setting tittle font extension color
	    counter++;
	}
	
	element = doc_element.getElementsByClassName("nav");
	counter = 0;
	while(element[counter] != null){
	    element[counter].style.color = font_color;							// Setting navigation font extension color
	    counter++;
	}
	
	element = doc_element.getElementsByClassName("quote");
	counter = 0;
	while(element[counter] != null){
	    element[counter].style.backgroundColor = bg_color;						// Setting quote background extension color
	    element[counter].style.color = font_color;							// Setting quote font extension color
	    counter++;
	}
    }
}

function window_onload()										// Removing "height: 20px;" post property  (it's set by onload native function)
{
    var element;
    var counter;
    
    element = document.querySelectorAll(".windowbg, .windowbg2");					// Getting post elements
    
    for(counter = 0; counter < element.length; counter++)
    {
	if(element[counter].getElementsByClassName("td_headerandpost")[0] != null){			// Removing "style=\"height: 20px;\"" string
	    element[counter].innerHTML = element[counter].innerHTML.replace(/style=\"height: 20px;\"/g, "");
	}
    }
}

function insert_footer(doc_element)
{
    var footerarea_element;
    
    footerarea_element = doc_element.getElementById("footerarea");
    if(footerarea_element != null)
    {
	var spanish_thread = "<a href=\"https://bitcointalk.org/index.php?topic=708721.0\" target=\"_blank\">Spanish Thread</a>";
	var english_thread = "<a href=\"https://bitcointalk.org/index.php?topic=708721.0\" target=\"_blank\">English Thread</a>";	// FIXME
	var download_link = "<a href=\"https://github.com/fernar1os/A-Bitcointalk-Extension\">Download source</a> (\"Download ZIP\" in bottom right corner)";
	
	footerarea_element.outerHTML += "<center><div style=\"color:" + font_color +
	    ";border:1px; border-style:solid; border-color:" + font_color + "; padding:4px;\"> " +
	    "<span style=\"white-space:nowrap;\"><b>A Bitcointalk Extension</b> by fernarios</span> | " +
	    "<span style=\"white-space:nowrap;\">Help, comments and feedback: " + english_thread + " - " + spanish_thread + "</span> | " +
	    "<span style=\"white-space:nowrap;\">Tips: <b>1GukYc7CtgYCbBQtAWxupgkfZqPWuUDREo</b> (thank you!)</span> | " +
	    "<span style=\"white-space:nowrap;\">Licence: GPL v. 3</span> | " +
	    "<span style=\"white-space:nowrap;\">" + download_link + "</span>" +
	    "</div></center><br><br>";
    }
}

function get_date_today()										// Date number format: AAAAMMDD
{
    var date_today = new Date();
    var year = date_today.getFullYear();
    var month = date_today.getMonth();
    var day = date_today.getDate();
    
    var date = (((parseInt(year)*100) + parseInt(month)) * 100) + parseInt(day);
    
    return(date);
}

function local_storage_get_item(key)
{
    localStorage.setItem(key + "_date", get_date_today());						// Saving key access date
    return(localStorage.getItem(key));
}

function clean_local_storage()
{
    var counter = 0;
    var register_key_string;
    var date_today;
    
    clean_storage_date_reg = localStorage.getItem("clean_storage_date");
    date_today = get_date_today();
    
    if(clean_storage_date_reg != null)									// Cleaning old keys and data (not accessed for a while)
    {
	if(date_today - parseInt(clean_storage_date_reg) > days_to_clean_storage)			// Cleaning old keys if date of last cleaning is older that 'days_to_clean_storage'
	{
	    counter = 0;
	    while(localStorage.key(counter) != null)							// Walk through all localStorage data
	    {
		register_key_string = localStorage.key(counter) + "_date";
		register_date = localStorage.getItem(register_key_string);				// Registry access date
		
		if(localStorage.key(counter).indexOf("_date") < 0)					// If key is not an access date
		{
		    if(register_date != null)
		    {
			if(date_today - parseInt(register_date) > days_to_clean_storage)		// Cleaning this key if access date is older that 'days_to_clean_storage'
			{
			    localStorage.removeItem(localStorage.key(counter));				// Removing key data
			    localStorage.removeItem(register_key_string);				// Removing access date for this key
			}
		    }
		    else
		    {
			localStorage.setItem(register_key_string, date_today);				// Setting new date for this key
		    }
		}
		counter++;
	    }
	    localStorage.setItem("clean_storage_date", date_today);					// Restarting clean_storage_date
	}
    }
    else
    {
	localStorage.setItem("clean_storage_date", date_today);						// Initializing clean_storage_date
    }
}

window.addEventListener("load",window_onload,false);							// Listening current page on load event

setTimeout(window_timer, 1000);										// Start timer function (every second)

clean_local_storage();


/*
 * DONE:
 * 0.1:
 * auto-hide read post
 * "hide" and "mark unread from here" buttons
 * multiple users data storage
 * direct link to last read post when click in topic's name link
 * youtube embed
 * bitcoin address detection (link to blockchain.info)
 * 
 * 0.2:
 * cascade forums and topics
 * dark style
 * 
 * 0.3:
 * overlay topic
 *  
 * TODO:
 * bitcoin price block
 * auto print new post
 * cascade quotes button for post 
 * cascade quotes button for topic 
 * follow topics alerts and prints
 * follow sub-forums alerts and prints
 * follow users activity
 * follow bitcoin addresses (balance and transactions) (blockchain.info integration?)
 * search in topic
 * drag and drop text and post as Quote (with source if possible)
 * top hot topics
 * drag and drop images in new post (automatic upload to imgurl?)
 */
