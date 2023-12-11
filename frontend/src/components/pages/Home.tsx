import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserCard from "../UserCard";
import Leaderboard from "../LeaderBoard";
import ChatBoard from '../HomeBoard';
import { Friend, User } from "../../types";
import ChatPageUsers from '../ChatPageUsers';
import ChatPageGroups from '../ChatPageGroups';
import About from './About';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from "react-redux";
import { selectChatStore } from "../../redux/store";
import { Stack } from "@mui/material";
import { HOME_SECTION, logStatus } from "../../enums";
import HomeBoard from '../HomeBoard';
import EditProfile from '../EditProfile';
import { getSocket } from '../../utils/socketService';
import ChatPageGameRequests from '../ChatPageGameRequests';
import { BACKEND_URL } from '../../data/Global';
import { updateChatBlockedUsers } from '../../redux/slices/chatSlice';


type TUserState = {
	userCode: {
		code: (string | null)
		setCode: React.Dispatch<React.SetStateAction<string | null>>
	},
	loginState: {
		isLogin: boolean
		setIsLogin: React.Dispatch<React.SetStateAction<boolean>>
	},
	userId: string | null,
	setUserId: React.Dispatch<React.SetStateAction<string | null>>,
	// is2faEnabled: boolean,
	state: string,
	token2fa: string,
	setToken2fa: React.Dispatch<React.SetStateAction<string>>,
	section: Number,
}



const Home = ({
	userCode,
	loginState,
	userId, setUserId,
	state,
	token2fa,
	setToken2fa,
	section
}: TUserState) => {

	const enum AuthResp {
		DEFAULT,
		IS2FA,
		ISNOT2FA
	}

	const [usersInfo, setUsersInfo] = useState<User[] | null>(null);
	const [authCount, setAuthCount] = useState<number>(0);
	const id = userId;
	const urlFriends = `${BACKEND_URL}/pong/users/` + id + '/friends';
	const [userFriends, setUserFriends] = useState<User[] | null>(null);
	const [friends, setFriends] = useState<Friend[] | null>(null);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [selectSection, setSelectSection] = useState<Number>(section);
	const [firstLogin, setFirstLogin] = useState<boolean>(false);
	const [showScreen, setShowScreen] = useState<'default' | 'achievements' | 'friends' | 'stats' | 'userProfile'>('default');
	const socket = getSocket(userId);
	const chatStore = useSelector(selectChatStore);

	const verifyToken = async (token: string): Promise<any> => {
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${process.env.REACT_APP_SECRET}`
		};
		const resp = await axios.post(`${BACKEND_URL}/pong/users/auth/token`, { token }, { headers });
		if (resp.status === 200) {
			return resp.data;
		}
	}
	const authenticateToAPI = async (token: string, state: string): Promise<any> => {
		if (token.length != 0 && state.length !== 0) {
			try {
				const headers = {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${process.env.REACT_APP_SECRET}`
				};

				const resp = await axios.post(`${BACKEND_URL}/pong/users/auth`, { token, state },
					{ withCredentials: true, headers: headers }
				);
				if (resp.status === 200) {
					const userAccessToken = resp.data;
					const userData = { ...userAccessToken, user: await verifyToken(userAccessToken.access_token) };
					if (userData.is2Fa === true) {
						loginState.setIsLogin(false);
						setToken2fa(userData.token2fa);
						Cookies.remove('userId');
						Cookies.remove('isAuth');
						return AuthResp.IS2FA;
					}
					else {
						loginState.setIsLogin(true);
						console.log(userData);
						if (userData.user === null) {
							return;
						}
						setUserId(userData.user.id.toString());
						if (userData.isFirstLogin) {
							setShowScreen('userProfile');
						}
						Cookies.set('userId', userData.user.id, { expires: 7 });
						Cookies.set('isAuth', 'true', { expires: 7 });
						Cookies.set('userName', userData.user.userNameLoc, { expires: 7 });
						return AuthResp.ISNOT2FA;
					}
				}
			}
			catch (error) {
				console.log('--------------------------Error authentication--------------------------\n');
			}
		}
	}

	const getUsersInfo = async () => {
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${process.env.REACT_APP_SECRET}`
		};
		try {
			const response = await axios.get<User[]>(`${BACKEND_URL}/pong/users/`, { headers });
			if (response.status === 200) {
				setUsersInfo(response.data);
				// console.log('Received Users Info: ', response.data)
			}
		}
		catch (error) {
			console.log('Error fetching users infos', error);
		}
	}

	const getFriends = async () => {
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${process.env.REACT_APP_SECRET}`
		};
		try {
			if (userId !== null) {
				const response = await axios.get<Friend[]>(urlFriends, { headers });
				if (response.status === 200) {
					setFriends(response.data);
					// console.log('Received Friends data', response.data);
				}
			}
		}
		catch (error) {
			console.log('Error receiving Friends information: ', error);
		}
	}

	useEffect(() => {
		if (userCode.code !== null && loginState.isLogin && userId === null) {
			(async () => {
				const codeTok = userCode.code + '';
				const auth = await authenticateToAPI(codeTok, state);
				if (auth == AuthResp.ISNOT2FA) {
					navigate('/');
				}
				if (auth === AuthResp.IS2FA) {
					navigate('/login2fa');
				}
			})();
		}
	}, [userId]);

	useEffect(() => {
		(async () => {
			if (userId !== null && loginState.isLogin) {
				if (friends === null) {
					getFriends()
				}
				if (usersInfo === null) {
					getUsersInfo()
				}
				if (userFriends === null && usersInfo) {
					const usersFriends = usersInfo?.filter((user) =>
						friends?.some((friend) => friend.sender === user.id || friend.receiver === user.id && user.id != userId)
					);
					if (userFriends !== null) {
						setUserFriends(usersFriends);
					}
				}
			}
		})();
	}, [userId, loginState.isLogin]);

	if (socket) {
		// socket.emit('allBlock', {});
		// socket.once('allBlockSuccess', (data: any) => {
		// 	console.log('-BLOCKES--\n');
		// 	console.log(data);
		// 	dispatch(updateChatBlockedUsers(data));
		// 	console.log(chatStore.chatBlockedUsers);
		// });
		// ---new channel created---------------
		socket.on('newChannel', (channel: any) => {
			console.log('channel created successfully');
			console.log(channel);
		});
		// --friend invitation sent ------
		socket.on('invitedByFriend', (receiver: any) => {

			console.log('friend invited successfully', receiver);
		});

		// ------------disconnexion-----------------------------
		socket.on('disconnected', (user: any) => {
			console.log(user.userNameLoc, 'is disconnected\n');
		});
		/******************************* */
	}
	// // hack for access
	// // to be removed later
	// loginState.setIsLogin(true)
	// setUserId('1');
	if (!userId && !loginState.isLogin) {
		return (
			<>
				<About isAuth={loginState.isLogin}></About>
			</>
		);
	}
	else {
		return (
			<>
				<div className='h-5/6 w-full relative'>
					<div className="flex h-full p-1 bg-gray-200 justify-between">
						<div className="space-y-8 min-w-[70px]">
							<HomeBoard section={selectSection} setSection={setSelectSection} />
						</div>
						<div className="flex w-full">
							{selectSection === HOME_SECTION.PROFILE && (
								<div className="flex justify-evenly space-y-8 items-center h-full w-full">
									<div className="flex flex-col space-y-2">
										<UserCard userId={userId} />
										<div className="flex justify-between items-center min-w-[200px] bg-slate-900 text-center rounded-lg">
											{userFriends ? userFriends.map((user, index) => (
												<div key={index} className="flex items-center">
													<img className="h-6 w-6 dark:bg-slate-200 rounded-full" src={user.avatar} alt="User avatar" />
													{user.userNameLoc}
												</div>
											)) : (
												<img className='h-full w-full rounded-lg' src='https://media0.giphy.com/media/KG4ST0tXOrt1yQRsv0/200.webp?cid=ecf05e4732is65t7ah6nvhvwst9hkjqv0c52bhfnilk0b9g0&ep=v1_stickers_search&rid=200.webp&ct=s' />
											)}
										</div>
									</div>
									<div className='w-2/3 h-2/3'>
										{socket !== null && <Leaderboard userId={userId} />}
									</div>
								</div>
							)}
							{selectSection === HOME_SECTION.CHAT_USER && <ChatPageUsers userId={userId} />}
							{selectSection === HOME_SECTION.CHAT_GROUP && <ChatPageGroups userId={userId} />}
						</div>
					</div>
				</div>
				{showScreen === 'userProfile' && <EditProfile setShowScreen={setShowScreen} userId={userId} />}
			</>

			// return (
			// 	<>
			// 		<div className='h-5/6 w-5/6'>
			// 			<div className="flex flex-wrap h-full">
			// 				<Stack
			// 					direction={"row"} height={"80%"} p={1} bgcolor={"#eee"}
			// 					justifyContent={"space-between"} alignItems={"centered"}
			// 				>
			// 					<Stack spacing={2} minWidth={70}>
			// 						<HomeBoard section={selectSection} setSection={setSelectSection} />
			// 					</Stack>
			// 					<Stack sx={{
			// 						gridGap: "0px",
			// 						height: "100%",
			// 						width: "100%",
			// 					}}
			// 					>
			// 						{
			// 							(selectSection === HOME_SECTION.PROFILE) ?
			// 								(
			// 									<Stack direction={"row"} justifyContent={"space-between"}
			// 										alignItems={"centered"}
			// 									>
			// 										<Stack minWidth={400} spacing={2} justifyContent={"space-between"}>
			// 											<UserCard userId={userId}></UserCard>
			// 											<div className="flex flex-row justify-between items-center min-w-[200px] min-h-[200px] bg-slate-900 text-center rounded-lg">
			// 												{userFriends != null ? userFriends.map((user, index) => (
			// 													<div key={index}>
			// 														<img
			// 															className="h-6 w-6 dark:bg-slate-200 rounded-full"
			// 															src={user.avatar}
			// 															alt="Achievement badge"
			// 														/> {user.userNameLoc}
			// 													</div>
			// 												)) : <img className='h-full w-full rounded-lg' src='https://media0.giphy.com/media/KG4ST0tXOrt1yQRsv0/200.webp?cid=ecf05e4732is65t7ah6nvhvwst9hkjqv0c52bhfnilk0b9g0&ep=v1_stickers_search&rid=200.webp&ct=s' />}
			// 											</div>
			// 										</Stack>
			// 										<Stack paddingLeft={1}>
			// 											{(socket !== null) ? (<Leaderboard userId={userId} />) : (<></>)}
			// 										</Stack>
			// 									</Stack>
			// 								)
			// 								: null

			// 						}
			// 						{selectSection === HOME_SECTION.CHAT_USER ? <ChatPageUsers userId={userId} /> : null}
			// 						{selectSection === HOME_SECTION.CHAT_GROUP ? <ChatPageGroups userId={userId} /> : null}
			// 						{/* {selectSection === HOME_SECTION.GAME_REQUEST ? <ChatPageGameRequests userId={userId}  /> : null} */}

			// 					</Stack>
			// 				</Stack>
			// 			</div>
			// 		</div>
			// 		{showScreen === 'userProfile' ? <EditProfile setShowScreen={setShowScreen} userId={userId} /> : null}
			// 	</>
		);
	}
}

export default Home