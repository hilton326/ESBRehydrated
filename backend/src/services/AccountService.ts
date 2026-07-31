import { getAccountById, updateAccountDisplayName } from '../repository/AccountRepository';
import { Account, AccountInfo } from '../types/AccountTypes';


export async function getAccountInfoFromId(id: number) {
    const account: Account = await getAccountById(id);
    if (!account) {
        return {error: `Account ${id} not found in database`};
    }
    return account;
}

export async function getEmailById(id: number) {
    const account: Account = await getAccountById(id);
    if (!account) {
        return {error: `Account ${id} not found in database`};
    }
    return {email: account.email};
}

export async function getDisplayNameById(id: number) {
    const account: Account = await getAccountById(id);
    if (!account) {
        return {error: `Account ${id} not found in database`};
    }
    return {name: account.name};
}

export async function getAccountStatusById(id: number) {
    const account: Account = await getAccountById(id);
    if (!account) {
        return {error: `Account ${id} not found in database`};
    }
    return {verified: account.verified};
}

export async function changeDisplayName(id: number, newName: string) {
    const updatedAccount: Account = await updateAccountDisplayName(id, newName);
    if (!updatedAccount) {
        return {success: false, error: `Could not update display name for account ${id} in database`};
    }
    return {success: true, account: updatedAccount};
}
