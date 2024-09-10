class PeerService {
    public peer: RTCPeerConnection | null = null;
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

  async getAnswer(offer: unknown){
    await this.peer?.setRemoteDescription( new RTCSessionDescription(offer as RTCSessionDescriptionInit));
    const ans = await this.peer?.createAnswer();
    await this.peer?.setLocalDescription(new RTCSessionDescription(ans!));
    return ans;
  }

  async getOffer(){
    const offer = await this.peer?.createOffer();
    await this.peer?.setLocalDescription(new RTCSessionDescription(offer!));
    return offer;
  }

  async setLocalDescription(ans: unknown) {
    if (this.peer) {
      await this?.peer?.setRemoteDescription(new RTCSessionDescription(ans as RTCSessionDescriptionInit));
    }
  }
}

export default new PeerService();
