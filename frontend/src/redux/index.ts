//  chat action type and interface definition

import { User, Friend, Group, JoinGroup, Chat, GameType, Block } from "../types";

export const enum CHAT_ACTION_TYPE {
  CHAT_CONTACT = "CHAT_CONTACT",
  CHAT_STARRED = "CHAT_STARRED",
  CHAT_SHARED = "CHAT_SHARED",
}

export interface IChatSidebar {
  open: boolean;
  type: string;
}

export interface IChatState {
  chatSideBar: IChatSidebar;
  chatUsers: User[];
  chatUserFriends: Friend[];
  chatUserFriendRequests: Friend[];
  chatGroupList: (Group | null)[];
  chatGroupMembers: JoinGroup[];
  chatType: String | null;
  chatRoomId: String | null;
  chatActiveUser: Friend | null;
  chatUserFriendDialogState: boolean;
  chatUserMessages: Chat[];
  chatActiveGroup: Group | null;
  chatGroupDialogState: boolean;
  chatGroupCreateFormPasswdState: boolean;
  chatGameRequests: GameType[];
  chatGameRequest: GameType | null,
  chatGroupUsrPassInp: string,
  chatGroupChkPassInpState: boolean,
  chatPreActiveGroup: Group | null,
  chatBlockedUsers: (Block | null)[],
}


interface IActionPayload {
  type: string;
  payload: IChatState;
}

interface IActionState {
  type: string;
}

export type TAction = IActionPayload | IActionState;
