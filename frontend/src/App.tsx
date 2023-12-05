import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Login from './components/pages/Login';
import Login2fa from './components/pages/Login2fa';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/pages/Home';
import Profile from './components/pages/Profile';
import About from './components/pages/About';
import PageNotFound from './components/pages/PageNotFound';
import Footer from './components/Footer';
import GameSelection from './components/pages/GameSelection';
import Cookies from 'js-cookie';
import { Utils__isAPICodeAvailable } from './utils/utils__isAPICodeAvailable';
import { getSocket } from './utils/socketService';
import { GameType, Chat, Block } from './types';
import { updateChatUserMessages, updateChatUserFriendRequests, updateChatUserFriends, updateChatUsers, updateChatGroups, updateChatGroupMembers, updateChatBlockedUsers } from "./redux/slices/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectChatStore } from "./redux/store";
import { fetchAllFriends, fetchAllMessages, fetchAllUsersFriends } from './data/ChatData';
import GameChallenge from './components/GameChallenge';
import Game from './components/pages/Game';
import { ACCEPTED, PENDING } from './APP_CONSTS';
import Game_2 from './components/pages/Game_2';
import { HOME_SECTION } from './enums';



const App: React.FC = () => {

	const generateStrState = (): string => {
		var token = '';
		const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@&#*./\\%!?_';
		for (let i = 0; i < 10; i++) {
			const min = 0;
			const max = letters.length;
			const idx = Math.floor(Math.random() * (max - min + 1)) + min;
			token += letters[idx];
		}
		return token;
	}
	const authSession: boolean = Cookies.get('isAuth') ? true : false;
	const userCookie = Cookies.get('userId');
	const idSession: string | null = userCookie ? userCookie : null;
	const [isAuth, setIsAuth] = useState<boolean>(authSession);
	const [userId, setUserId] = useState<string | null>(idSession);
	const [code, setCode] = useState<string | null>(null);
	const [state, setState] = useState<string>(generateStrState());
	const [token2fa, setToken2fa] = useState<string>('');
	const [challenge, setChallenge] = useState<boolean>(false);
	const [game, setGame] = useState<GameType>();
	const socket = getSocket(userId);
	const dispatch = useDispatch();
	const chatStore = useSelector(selectChatStore);

	// check if code available for backend to exchange for token
	Utils__isAPICodeAvailable({ setIsAuth, isAuth, setCode, code })


	//----------------------------CHAT---------------------------
	useEffect(() => {
		if (socket != null) {
			socket.on('kickMemberSucces', (data: any) => {
				dispatch(updateChatGroupMembers(data.all));
			});
			socket.on('memberMuteToggleSuccess', (data: any) => {
				dispatch(updateChatGroupMembers(data.all));
			});
			socket.on('unblockSuccess', (blocks: Block[]) => {
				dispatch(updateChatBlockedUsers(blocks));
			});
			socket.on('acceptMemberSuccess', (data: any) => {
				dispatch(updateChatGroupMembers(data.all));
			});
			socket.on('declinedMemberSuccess', (data: any) => {
				dispatch(updateChatGroupMembers(data.all));
			});
			socket.on('deleteGroupSucces', (data: any) => {
				dispatch(updateChatGroups(data.all));
			});
			socket.on('groupPasswordChanged', (data: any) => {
				dispatch(updateChatGroups(data.all));
			});
			socket.on('channelTitleChanged', (data: any) => {
				dispatch(updateChatGroups(data.all));
			});
			socket.on('newMembers', (data: any) => {
				dispatch(updateChatGroupMembers(data.all))
			});
			socket.on('exitGroupSuccess', (data: any) => {
				dispatch(updateChatGroupMembers(data.all));
			});
			socket.on('BlockedFriendSucces', (data: any) => {
				dispatch(updateChatBlockedUsers(data.all));
			});
			socket.on('newChannel', (data: any) => {
				dispatch(updateChatGroups(data.groups));
				dispatch(updateChatGroupMembers(data.members));
			});
			socket.on("receiveMessage", (data: any) => {
				dispatch(updateChatUserMessages(data.all));
			});

			socket.on('inviteFriendSucces', (data: any) => {
				if (data.new.sender != userId && data.new.receiver != userId) {
					return;
				}
				const newFriendRequestList = fetchAllUsersFriends(PENDING, data.all);
				dispatch(updateChatUserFriendRequests(newFriendRequestList));
			});

			socket.on('newFriend', (data: any) => {
				if (data.new.sender != userId && data.new.received != userId) {
					return;
				}
				const newFriendRequestList = fetchAllUsersFriends(PENDING, data.all);
				const newFriendList = fetchAllUsersFriends(ACCEPTED, data.all);
				dispatch(updateChatUserFriendRequests(newFriendRequestList));
				dispatch(updateChatUserFriends(newFriendList));
			});

			socket.on('deniedFriend', (data: any) => {
				const newFriendRequestList = fetchAllUsersFriends(PENDING, data.all);
				const newFriendList = fetchAllUsersFriends(ACCEPTED, data.all);
				dispatch(updateChatUserFriendRequests(newFriendRequestList));
				dispatch(updateChatUserFriends(newFriendList));
			});

			socket.on('logout', (data: any) => {
				dispatch(updateChatUsers(data.all));
				if (data.new.userId == userId) {
					socket.disconnect();
				}
			});

			socket.on('connected', (data: any) => {
				dispatch(updateChatUsers(data.all));
			});

			socket.on('joinChannelSucces', (data: any) => {
				dispatch(updateChatGroupMembers(data.all));
			});
		}
	});

	//---------------------------GAME-----------------------------------------------
	useEffect(() => {
		if (socket != null) {
			socket.on('invitedToMatch', (data: any) => {
				console.log("Invitation received!", userId, "   ", data.player2, "\n\n");
				if (data.player2 == userId) {
					setChallenge(true);
					console.log("I got invited to a game! \n\n");
					setGame(data);
					console.log("Match invitation received! \n\n", data);
				}
			});
		} else {
			console.log("Missing socket\n");
		}
	});

	const title = document.getElementsByTagName('title');
	title[0].innerHTML = 'Transcendance App';
	return (
		<div className='flex-cols font-mono dark:bg-white/75 bg-slate-900 bg-opacity-80 h-screen'>
			<Router>
				<div className='h-20 flex backdrop-blur-sm bg-white/75 dark:bg-slate-900 border-b-4 border-white/75 dark:border-slate-600 item-center justify-between'>
					<Navbar setIsAuth={setIsAuth} isAuth={isAuth} setCode={setCode} setUserId={setUserId} />
				</div>
				<Routes>
					<Route path='about' element={<About isAuth={isAuth} />} />
					<Route path='/' element={<Home
						userCode={{ code: code, setCode: setCode }}
						loginState={{ isLogin: isAuth, setIsLogin: setIsAuth }} setUserId={setUserId}
						userId={userId} state={state}
						token2fa={token2fa}
						setToken2fa={setToken2fa}
						section={HOME_SECTION.PROFILE}
					/>} />
					<Route path='/login' element={<Login isAuth={isAuth} setIsAuth={setIsAuth} state={state} />} />
					<Route path='/login2fa' element={
						<Login2fa isAuth={isAuth}
							setIsAuth={setIsAuth}
							setUserId={setUserId}
							token2fa={token2fa}
							setToken2fa={setToken2fa}
						/>} />
					<Route path='/game' element={<ProtectedRoute isAuth={isAuth} path='/game' element={<GameSelection userId={userId} />} />} />
					<Route path='/game/pvp' element={<ProtectedRoute isAuth={isAuth} path='/game/pvp' element={<Game_2 difficulty={game ? game.difficulty : 0} userId={userId ? userId : "0"} includeBoost={game ? game.includeBoost : false} opponent={'player'} status={'found'} game={game ? game : undefined} />} />} />
					<Route path='/profile' element={<ProtectedRoute isAuth={isAuth} path='/profile' element={<Profile userId={userId} isAuth={isAuth} />} />} />
					<Route path='/chat' element={<Home
						userCode={{ code: code, setCode: setCode }}
						loginState={{ isLogin: isAuth, setIsLogin: setIsAuth }} setUserId={setUserId}
						userId={userId} state={state}
						token2fa={token2fa}
						setToken2fa={setToken2fa}
						section={HOME_SECTION.CHAT_USER}
					/>} />
					<Route path='/group' element={<Home
						userCode={{ code: code, setCode: setCode }}
						loginState={{ isLogin: isAuth, setIsLogin: setIsAuth }} setUserId={setUserId}
						userId={userId} state={state}
						token2fa={token2fa}
						setToken2fa={setToken2fa}
						section={HOME_SECTION.CHAT_GROUP}
					/>} />
					{/* <Route path='/gamerequest' element={<Home
						userCode={{ code: code, setCode: setCode }}
						loginState={{ isLogin: isAuth, setIsLogin: setIsAuth }} setUserId={setUserId}
						userId={userId} state={state}
						token2fa={token2fa}
						setToken2fa={setToken2fa}
						section={HOME_SECTION.GAME_REQUEST}
					/>} /> */}
					<Route path='/*' element={<PageNotFound />} />
				</Routes>
				<div className='h-20 shadow-xl flex backdrop-blur-sm bg-white/75 dark:bg-slate-900 border-t-4 border-slate-300 dark:border-slate-700 items-center justify-evenly'>
					<Footer />
				</div>
				{challenge ? <GameChallenge userId={userId} game={game} setChallenge={setChallenge} /> : null}
			</Router>

		</div>
	)
}
export default App;


/* CHAT-GPT:
Inside each component directory (pages, components, etc.), create an index.ts file if it doesn't already exist.

In the index.ts file, export the component from its corresponding file. For example, in components/index.ts:

jsx
Copy code
export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';
// Add other component exports as needed
Now, you can import the components using a single line in your code:
jsx
Copy code
import { Login, Navbar, ProtectedRoute, Home, Profile, LandingPage, About, PageNotFound, Footer } from './components';
By using the index.ts file, you can group and export multiple components from the same directory in a single import statement. This makes your import statements cleaner and more concise.

Make sure to adjust the file paths and directory names based on your project structure.

Note: If you have nested directories within the components directory, you can create additional index.ts files in those directories as well to export the nested components.
*/
