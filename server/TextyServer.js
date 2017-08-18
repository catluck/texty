var ws = require("ws");


function init()
{
	var server = new TextyServer(2001);
	server.init();
}

var TextyServer = function(newPort)
{
	
	////////////////////////////////////////////////////////////////////
	//	properties
	////////////////////////////////////////////////////////////////////
	var _port = newPort;
	var _users = {};
	var _currentKey = null;
	var _webSocketServer = null;
	var _nextUserId = 0;
	var _text = "abcdefg";
	var printable = /^[a-z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]*$/i;

	function getNewId()
	{
		return "user_" + (_nextUserId++);
	}


	////////////////////////////////////////////////////////////////////
	//	connection
	////////////////////////////////////////////////////////////////////
	function onConnection(websocket)
	{
		console.log("connected");
		var myUserId = getNewId();
		_users[myUserId] = websocket;
		websocket.send(_text);
		websocket.on("message", function(message)
		{
			_currentKey = myUserId;
			applyEdit(JSON.parse(message));
			broadcastEdit(message, myUserId);

		});
	};

	function broadcastEdit(data, userId)
	{
		for (var key in _users)
		{
			_currentKey = key;
			if (userId != key)
			{
				_users[key].send(data, onError);
			}
		}
	};
	
	function onError(error)
	{
		if (error)
		{
			delete _users[_currentKey];
			
		}
	};



	////////////////////////////////////////////////////////////////////
	//	text
	////////////////////////////////////////////////////////////////////
	function applyEdit(editData)
	{
		var key = editData.key;
		var position = editData.position;
		var textString = _text;

		switch(key)
		{
			case "Backspace":
				var start = textString.slice(0, position-1);
				var end = textString.slice(position);
				_text = start + end;
				break;

			default:
				if ((key == "\n" || key.match(printable)))
				{
					var start = textString.slice(0,position);
					var end = textString.slice(position);
					_text = start + key + end;
				}
		}
	}



	////////////////////////////////////////////////////////////////////
	//	public
	////////////////////////////////////////////////////////////////////
	this.init = function()
	{
		_webSocketServer = new ws.Server({
			port: _port,
		});
		_webSocketServer.on("connection", onConnection);
		//_webSocketServer.on("error", onError);
	};
};

init();