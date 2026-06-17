// Contains only non-sensitive account info about the sender of a message.
// Can be safely returned to all message receivers.

export interface Sender {
    name: string,
    profilePicture?: string
}