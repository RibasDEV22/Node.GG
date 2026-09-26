/* =========================================================
   ZapZap – media.js (COMPLETO)
   Gravação de áudio, anexos, visualização, WebRTC e Perfil
   ========================================================= */

let profileAvatarBase64 = null;

// ========== CONFIGURAÇÕES & PERFIL ==========
function showSettings() {
  const modal = document.getElementById('settings-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  if (currentUser) {
    const un = document.getElementById('profile-username');
    const dn = document.getElementById('profile-displayname');
    const bio = document.getElementById('profile-bio');
    const prev = document.getElementById('profile-avatar-preview');

    if (un) un.textContent = '@' + currentUser.username;
    if (dn) dn.value = currentUser.displayName || '';
    if (bio) bio.value = currentUser.bio || '';
    if (prev) {
      if (currentUser.avatar) {
        prev.style.backgroundImage = 'url("' + encodeURI(currentUser.avatar) + '")';
        prev.textContent = '';
      } else {
        prev.style.backgroundImage = '';
        prev.textContent = '📷';
      }
    }
  }

  populateMicList();
}

function hideSettings() {
  document.getElementById('settings-modal')?.classList.add('hidden');
}

function previewProfileAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    profileAvatarBase64 = ev.target.result;
    const prev = document.getElementById('profile-avatar-preview');
    if (prev) {
      prev.style.backgroundImage = 'url("' + encodeURI(profileAvatarBase64) + '")';
      prev.textContent = '';
    }
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  const dn = document.getElementById('profile-displayname')?.value.trim();
  const bio = document.getElementById('profile-bio')?.value.trim();

  const updateData = {
    type: 'update_profile',
    displayName: dn || undefined,
    bio: bio || undefined
  };

  if (profileAvatarBase64) {
    updateData.avatar = profileAvatarBase64;
  }

  sendWS(updateData);
  hideSettings();
}

async function populateMicList() {
  const select = document.getElementById('mic-select');
  if (!select || !navigator.mediaDevices?.enumerateDevices) return;

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter(d => d.kind === 'audioinput');
    select.innerHTML = '';

    mics.forEach((m, idx) => {
      const opt = document.createElement('option');
      opt.value = m.deviceId;
      opt.textContent = m.label || `Microfone ${idx + 1}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.warn('[Media] Erro ao listar microfones:', err);
  }
}

function onMicChange() {
  const select = document.getElementById('mic-select');
  if (select) {
    localStorage.setItem('zap_selected_mic', select.value);
  }
}

function onAudioPrefChange() {
  const vol = document.getElementById('audio-volume');
  const noise = document.getElementById('audio-noise');
  const smooth = document.getElementById('audio-smooth');
  const label = document.getElementById('audio-volume-label');

  if (vol) {
    audioVolumeBoost = parseInt(vol.value, 10);
    if (label) label.textContent = audioVolumeBoost + '%';
  }
  if (noise) audioNoiseReduction = noise.checked;
  if (smooth) audioSmoothVoice = smooth.checked;

  localStorage.setItem('zap_audio_prefs', JSON.stringify({
    volumeBoost: audioVolumeBoost,
    noiseReduction: audioNoiseReduction,
    smoothVoice: audioSmoothVoice
  }));
}

// ========== ANEXOS DE ARQUIVO ==========
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file || !activeChatTarget) return;

  if (file.size > 25 * 1024 * 1024) {
    alert('O arquivo excede o limite de 25MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = ev => {
    const base64Data = ev.target.result;
    let msgType = 'file';

    if (file.type.startsWith('image/')) msgType = 'image';
    else if (file.type.startsWith('audio/')) msgType = 'audio';
    else if (file.type.startsWith('video/')) msgType = 'video';

    const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

    sendWS({
      type: 'chat_message',
      to: activeChatTarget,
      media: base64Data,
      msg_type: msgType,
      tempId: tempId,
      media_meta: {
        name: file.name,
        size: file.size,
        mime: file.type
      }
    });

    appendChatMessage({
      id: tempId,
      sender: currentUser?.username,
      content: base64Data,
      msg_type: msgType,
      media_meta: { name: file.name, mime: file.type },
      isMe: true,
      timestamp: Date.now()
    });
  };

  reader.readAsDataURL(file);
  e.target.value = '';
}

// ========== GRAVAÇÃO DE VOZ ==========
async function startVoiceRecord() {
  if (isRecording) return;
  try {
    const micId = localStorage.getItem('zap_selected_mic');
    const constraints = {
      audio: micId ? { deviceId: { exact: micId } } : true
    };

    recordingStream = await navigator.mediaDevices.getUserMedia(constraints);
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(recordingStream);

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.start();
    isRecording = true;
    recordStartTs = Date.now();

    document.getElementById('recording-bar')?.classList.remove('hidden');
    document.getElementById('btn-record')?.classList.add('recording');
  } catch (err) {
    alert('Não foi possível acessar o microfone.');
    console.error('[AudioRecord]', err);
  }
}

function stopVoiceRecord() {
  if (!mediaRecorder || !isRecording) return;

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
    const duration = (Date.now() - recordStartTs) / 1000;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Audio = reader.result;
      const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

      if (activeChatTarget) {
        sendWS({
          type: 'chat_message',
          to: activeChatTarget,
          media: base64Audio,
          msg_type: 'audio',
          tempId: tempId,
          media_meta: { duration: duration, mime: 'audio/webm' }
        });

        appendChatMessage({
          id: tempId,
          sender: currentUser?.username,
          content: base64Audio,
          msg_type: 'audio',
          media_meta: { duration: duration },
          isMe: true,
          timestamp: Date.now()
        });
      }
    };
    reader.readAsDataURL(blob);
    cleanupRecordStream();
  };

  mediaRecorder.stop();
}

function cancelVoiceRecord() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.onstop = null;
    mediaRecorder.stop();
  }
  cleanupRecordStream();
}

function cleanupRecordStream() {
   isRecording = false;
   if (recordingStream) {
       recordingStream.getTracks().forEach(t => t.stop());
       recordingStream = null;
   }
   // FIX #8.0: Limpa elementos UI com segurança
   const recBar = document.getElementById('recording-bar');
   const recBtn = document.getElementById('btn-record');
   
   if (recBar) {
       try { recBar.classList.add('hidden'); } catch {}
   }
   if (recBtn) {
       try { recBtn.classList.remove('recording'); } catch {}
   }
}

// ========== VISUALIZADOR DE MÍDIA ==========
function openMediaViewer(src, type) {
  let modal = document.getElementById('media-viewer-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'media-viewer-modal';
    modal.className = 'modal-overlay';
    modal.onclick = () => modal.classList.add('hidden');
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="max-width:90vw;max-height:90vh;position:relative;" onclick="event.stopPropagation()">
      <button class="btn-icon" style="position:absolute;top:-40px;right:0;color:#fff;" onclick="document.getElementById('media-viewer-modal').classList.add('hidden')">❌</button>
      ${type === 'image' ? `<img src="${escapeAttr(src)}" style="max-width:100%;max-height:85vh;object-fit:contain;border-radius:8px;">` : ''}
    </div>
  `;
  modal.classList.remove('hidden');
}

// ========== CHAMADAS WEBRTC ==========
async function startCall() {
  if (!activeChatTarget) return;
  getAudioContext();

  currentCall.targetUser = activeChatTarget;
  currentCall.isActive = true;

  showCallModal(activeChatTarget, 'Chamando...');
  document.getElementById('call-actions-calling')?.classList.remove('hidden');

  try {
    const micId = localStorage.getItem('zap_selected_mic');
    currentCall.localStream = await navigator.mediaDevices.getUserMedia({
      audio: micId ? { deviceId: { exact: micId } } : true
    });

    currentCall.peerConnection = new RTCPeerConnection(RTC_CONFIG);
    currentCall.localStream.getTracks().forEach(track => {
      currentCall.peerConnection.addTrack(track, currentCall.localStream);
    });

    currentCall.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        sendWS({
          type: 'call_ice_candidate',
          to: currentCall.targetUser,
          candidate: event.candidate
        });
      }
    };

    currentCall.peerConnection.ontrack = event => {
      const remoteAudio = document.getElementById('remote-audio');
      if (remoteAudio) {
        remoteAudio.srcObject = event.streams[0];
      }
    };

    const offer = await currentCall.peerConnection.createOffer();
    await currentCall.peerConnection.setLocalDescription(offer);

    sendWS({
      type: 'call_offer',
      to: currentCall.targetUser,
      offer: offer
    });

    startRingtoneSound();
  } catch (err) {
    alert('Erro ao iniciar chamada ou obter microfone.');
    cleanupCall();
  }
}

function onCallIncoming(data) {
  getAudioContext();
  currentCall.targetUser = data.from;
  currentCall.pendingOffer = data.offer;
  currentCall.isActive = true;

  showCallModal(data.from, 'Chamada recebida');
  document.getElementById('call-actions-incoming')?.classList.remove('hidden');
  startRingtoneSound();
}

async function acceptCall() {
  stopRingtoneSound();
  document.getElementById('call-actions-incoming')?.classList.add('hidden');
  document.getElementById('call-actions-active')?.classList.remove('hidden');

  try {
    const micId = localStorage.getItem('zap_selected_mic');
    currentCall.localStream = await navigator.mediaDevices.getUserMedia({
      audio: micId ? { deviceId: { exact: micId } } : true
    });

    currentCall.peerConnection = new RTCPeerConnection(RTC_CONFIG);
    currentCall.localStream.getTracks().forEach(track => {
      currentCall.peerConnection.addTrack(track, currentCall.localStream);
    });

    currentCall.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        sendWS({
          type: 'call_ice_candidate',
          to: currentCall.targetUser,
          candidate: event.candidate
        });
      }
    };

    currentCall.peerConnection.ontrack = event => {
      const remoteAudio = document.getElementById('remote-audio');
      if (remoteAudio) remoteAudio.srcObject = event.streams[0];
    };

    await currentCall.peerConnection.setRemoteDescription(new RTCSessionDescription(currentCall.pendingOffer));
    const answer = await currentCall.peerConnection.createAnswer();
    await currentCall.peerConnection.setLocalDescription(answer);

    sendWS({
      type: 'call_answer',
      to: currentCall.targetUser,
      answer: answer
    });

    while (pendingIceCandidates.length > 0) {
      const cand = pendingIceCandidates.shift();
      await currentCall.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
    }

    setCallStatus('Em chamada');
  } catch (err) {
    alert('Erro ao atender chamada.');
    cleanupCall();
  }
}

async function handleCallAnswered(answer) {
  stopRingtoneSound();
  document.getElementById('call-actions-calling')?.classList.add('hidden');
  document.getElementById('call-actions-active')?.classList.remove('hidden');

  if (currentCall.peerConnection) {
    await currentCall.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    setCallStatus('Em chamada');
  }
}

async function onIceCandidate(data) {
  if (currentCall.peerConnection && currentCall.peerConnection.remoteDescription) {
    await currentCall.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
  } else {
    pendingIceCandidates.push(data.candidate);
  }
}

function rejectCall() {
  sendWS({ type: 'call_reject', to: currentCall.targetUser });
  cleanupCall();
}

function endCall() {
  if (currentCall.targetUser) {
    sendWS({ type: 'call_end', to: currentCall.targetUser });
  }
  cleanupCall();
}

function toggleMicrophone() {
  if (currentCall.localStream) {
    const audioTrack = currentCall.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      isMuted = !audioTrack.enabled;
      const btn = document.getElementById('btn-toggle-mic');
      if (btn) {
        btn.textContent = isMuted ? '🔇 Desmutar (F4)' : '🎙️ Mutar (F4)';
      }
    }
  }
}

function showCallModal(username, status) {
  const modal = document.getElementById('call-modal');
  const nameEl = document.getElementById('call-user-name');
  if (modal) modal.classList.remove('hidden');
  if (nameEl) nameEl.textContent = username;
  setCallStatus(status);
}

function setCallStatus(status) {
  const stEl = document.getElementById('call-status-text');
  if (stEl) stEl.textContent = status;
}

function cleanupCall() {
  stopRingtoneSound();

  if (currentCall.peerConnection) {
    currentCall.peerConnection.close();
  }
  if (currentCall.localStream) {
    currentCall.localStream.getTracks().forEach(t => t.stop());
  }

  currentCall = {
    peerConnection: null,
    localStream: null,
    targetUser: null,
    pendingOffer: null,
    isActive: false
  };

  pendingIceCandidates = [];

  const modal = document.getElementById('call-modal');
  if (modal) modal.classList.add('hidden');

  document.getElementById('call-actions-calling')?.classList.add('hidden');
  document.getElementById('call-actions-incoming')?.classList.add('hidden');
  document.getElementById('call-actions-active')?.classList.add('hidden');
}

document.addEventListener('keydown', e => {
  if (e.key === 'F4' && currentCall.isActive) {
    e.preventDefault();
    toggleMicrophone();
  }
});
