
import { Box, Stack, IconButton, Typography, Divider, Avatar, Badge, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Plus, Handshake} from "phosphor-react";
import { useEffect, useState } from "react";
import img42 from "../img/icon_42.png"
import ChatPageGroupsCreate from "./ChatPageGroupsCreate";

import { ChatProps, Group, JoinGroup } from "../types";
import ChatConversation, { getUserById } from "./ChatConversation";
import ChatGroupProfile from "./ChatGroupProfile";
import { selectChatDialogStore, selectChatStore } from "../redux/store";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { selectConversation, updateChatActiveGroup, updateChatGroupChkPassInpState, updateChatPreActiveGroup } from "../redux/slices/chatSlice";
import { enChatPrivacy, enChatType } from "../enums";
import Cookies from 'js-cookie';
import { updateChatDialogGroupInvite, updateChatDialogInpPasswd, updateChatDialogShwMsg } from "../redux/slices/chatDialogSlice";
import ChatDialogGroupInvite from "./ChatDialogGroupInvite";
import { fetchAllMembers, getMembers } from "../data/ChatData";
import ChatGroupFormInputPasswd from "./ChatGroupFormInputPasswd";
import ChatDialogShwMsg from "./ChatDialogShwMsg";


const ChatGroupElement = (group : Group) => {
    const dispatch = useDispatch();
    const userId = Cookies.get('userId') ? Cookies.get('userId') : '';
    const chatStore = useSelector(selectChatStore);
    const chatDialogStore = useSelector(selectChatDialogStore)
    const groupOwnerUserData = getUserById(chatStore.chatUsers, group.ownerId)


    const joinChannel = () => {

            dispatch(selectConversation({chatRoomId: group.channelId, chatType: enChatType.Group}))
            dispatch(updateChatActiveGroup(chatStore.chatGroupList.filter((el: any) => {
                if (el && (el.channelId == group.channelId)) {
                    return el;
                }
            })[0]));
    }
    
    

    const HandleOnClick = async () => {
        dispatch(updateChatPreActiveGroup(group));
        if (group.privacy == enChatPrivacy.PROTECTED && group.channelId != chatStore.chatActiveGroup?.channelId)
        {
            dispatch(updateChatDialogInpPasswd(true))
        }
        else if (group.privacy == enChatPrivacy.PRIVATE && group.channelId != chatStore.chatActiveGroup?.channelId)
        {
            const allMembers =  await fetchAllMembers();
            const groupMembers = getMembers(allMembers, group.channelId)
            const userGroupData = groupMembers.filter((el) => { 
                if (userId && parseInt(userId) == el.userId)
                    return el;
            })// uncomment for production
            // const userGroupData : JoinGroup[] = []      // for dev purpose

            userGroupData.length ? joinChannel() 
            : dispatch(updateChatDialogShwMsg(true))
        }
        else // group channel is public
        {
            joinChannel()
        }

    }

    useEffect(() => {
    }, [chatStore.chatActiveGroup, 
        chatDialogStore.chatDialogInpPasswd,
        chatStore.chatGroupUsrPassInp,
        chatStore.chatActiveGroup,
        chatStore.chatGroupMembers,
        chatStore.chatGroupList]);

    useEffect(()=> {
        if (chatStore.chatGroupChkPassInpState)// true means that user have inputted passwd and submit form 
        {
            if (chatStore.chatGroupUsrPassInp == group.password)
            {
                dispatch(selectConversation({chatRoomId: group.channelId, chatType: enChatType.Group}))
                dispatch(updateChatActiveGroup(chatStore.chatGroupList.filter((el: any) => {
                    if (el && (el.channelId == group.channelId)) {
                        return el;
                }
                })[0]));
                dispatch(updateChatDialogShwMsg(false)) // Dont Show error message
                
            }
            else
            {
                dispatch(updateChatDialogShwMsg(true))
                console.log("dialog, error, ", chatStore.chatGroupChkPassInpState, chatDialogStore.chatDialogShwMsg)
                // alert("wrong password! contact group owner (" + groupOwnerUserData?.userName + ") + " + chatStore.chatGroupChkPassInpState)
            }
            dispatch(updateChatGroupChkPassInpState(false));
        }

    // },[]) 
    }, [chatStore.chatGroupChkPassInpState])

    return (
        <Box 
            onClick={HandleOnClick}
            sx={{
                width: "100%",
                backgroundColor: "#ddd",
                borderRadius: 1
            }}
            p={2}
        >
            <Stack 
                direction={"row"}
                alignItems={"center"} 
                justifyContent={"space-between"}
            >
                <Stack direction="row" spacing={2}>
                    <Badge 
                        overlap="circular"
                    >
                        <Avatar alt={ group.title } src={ img42 }/>
                    </Badge>
                    <Stack spacing={0.2}>
                        <Typography variant="subtitle2">{ group.title }</Typography>
                        <Typography variant="caption">{ `${ getMembers(chatStore.chatGroupMembers, group.channelId).length } Members` } </Typography>
                    </Stack>
                </Stack>
                <Stack spacing={2} alignItems={"center"}>
                </Stack>

            </Stack>
        </Box>
    ); 
}


const  ChatPageGroups = (chatProp : ChatProps) => {
    const theme = useTheme();
    const dispatch = useDispatch()
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const chatStore = useSelector(selectChatStore)
    const chatDialogStore = useSelector(selectChatDialogStore)

    const handleCloseDialog = () => {
        setOpenDialog(false);
    }
    const handleOpenDialogGroupInvite = ()=>{
        dispatch(updateChatDialogGroupInvite(true));
    }

    useEffect(() => {

    }, [chatStore.chatActiveGroup, chatStore.chatGroupList, chatStore.chatGroupMembers]);

    return (
        <>
        <Stack direction={"row"} sx={{ width: "95vw"}}>

            <Box 
              sx={{
                position:"relative",
                height: "100%",
                minWidth: "350px",
                backgroundColor: "white",
                boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)"
              }}>
                <Stack p={3} spacing={1} sx={{height:"75vh"}} >
                    <Stack direction={"row"} alignItems={"centered"} 
                        justifyContent={"space-between"}
                    >
                        <Typography variant='h5'>Channels</Typography>
                        <Stack alignItems={"centered"} spacing={1}>
                            <IconButton onClick={handleOpenDialogGroupInvite}>
                                <Handshake/>
                            </IconButton>
                        </Stack>
                    </Stack>
                    <Divider/>

                    {/* Chatgrouplist */}
                    <Stack 
                        direction={"row"} 
                        justifyContent={"space-between"} 
                        alignItems={"center"} 
                    >
                        <Typography variant="h5" component={Link}
                            onClick={ () => { setOpenDialog(true)}}
                        >
                            Create New Channel
                        </Typography>
                        <IconButton onClick={() => { setOpenDialog(true) }} >
                            <Plus style={{ color: theme.palette.primary.main }}/>
                        </IconButton>
                    </Stack>
                    <Divider/>
                    <Stack 
                        sx={{flexGrow:1, overflowY:"scroll", height:"100%"}}
                        spacing={0.5} 
                    >
                        { chatStore.chatGroupList.map((el) => {
                            if (el) 
                                return (<ChatGroupElement key={el.channelId} {...el} />) })}
                    </Stack>
                </Stack>
            </Box>

            {/* Right side : conversation panel */}
            <Stack sx={{ width: "100%" }} alignItems={"center"} justifyContent={"center"}>
                {chatStore.chatRoomId !== null && chatStore.chatType === enChatType.Group 
                    ? <ChatConversation userId={ chatProp.userId }/>
                    : <Typography variant="subtitle2">Select channel chat or create new</Typography>
                }
            </Stack>
                
            {/* show the contact profile on toggle */}
            <Stack>
			{ chatStore.chatSideBar.open && <ChatGroupProfile/> }
            </Stack>
        </Stack>

        {/* create group channel form */}
        { openDialog && 
            <ChatPageGroupsCreate openState={openDialog} handleClose={handleCloseDialog}/>
        }
        {/* handle group list and invites dialog panel */}
        { chatDialogStore.chatDialogGroupInvite && <ChatDialogGroupInvite />}
        {/* control user access */}
        { chatDialogStore.chatDialogInpPasswd && <ChatGroupFormInputPasswd />}
        { chatDialogStore.chatDialogShwMsg && <ChatDialogShwMsg/> }
        </>
      );
}
 

export default ChatPageGroups;