
export const CODE_GS = `/**
 * ==============================================================================
 * LINE OA Internal Request System (v2.6)
 * ==============================================================================
 */

const CHANNEL_ACCESS_TOKEN = 'YOUR_LINE_CHANNEL_ACCESS_TOKEN'; 
const ADMIN_LINE_USER_IDS = ['YOUR_ADMIN_LINE_USER_ID'];
const MY_WEB_APP_URL = 'YOUR_WEB_APP_DEPLOY_URL';

const HEADERS = ['id', 'lineUserId', 'message', 'status', 'assignedTo', 'reply', 'createdAt', 'repliedAt', 'source', 'contactInfo', 'subject'];

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#f3f3f3");
  }
  return sheet;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    let postData;
    try {
      postData = e.postData ? JSON.parse(e.postData.contents) : {};
    } catch(f) { postData = {}; }

    const action = e.parameter.action || postData.action;
    
    if (action === 'reply') {
      const res = replyToUser(e.parameter.userId || postData.userId, e.parameter.text || postData.text, e.parameter.messageId || postData.messageId, e.parameter.admin || postData.admin);
      return createJsonResponse(res);
    }

    if (action === 'submitForm') {
      const sheet = getOrCreateSheet('Requests');
      const id = 'FORM-' + new Date().getTime();
      const subject = postData.subject || 'คำขอใช้บริการ';
      const contact = postData.contact || '-';
      const message = postData.message || '-';
      const lineUid = postData.lineUserId || 'FORM_USER';
      
      sheet.appendRow([id, lineUid, message, 'new', '', '', new Date(), '', 'form', contact, subject]);
      sendToAllAdmins("📝 ฟอร์มใหม่: " + subject + "\\nผู้ติดต่อ: " + contact + "\\nID: " + lineUid);
      return createJsonResponse({success: true, id: id});
    }

    if (e.postData && e.postData.contents && !action) {
      const data = JSON.parse(e.postData.contents);
      if (data.events && data.events.length > 0) {
        const event = data.events[0];
        const senderId = event.source.userId;

        if (event.type === 'follow') {
          sendPushMessage(senderId, "ยินดีต้อนรับ! ขอบคุณที่เพิ่มเราเป็นเพื่อน\\n\\nคุณสามารถแจ้งบริการและติดตามสถานะได้ที่ลิงก์นี้:\\n" + MY_WEB_APP_URL + "?userId=" + senderId);
          return createJsonResponse({status: 'ok'});
        }

        if (event.type === 'message' && event.message.type === 'text') {
          const sheet = getOrCreateSheet('Requests');
          const messageId = event.message.id;
          const userMessage = event.message.text;
          sheet.appendRow([messageId, senderId, userMessage, 'new', '', '', new Date(), '', 'line', '', 'LINE Message']);
          sendToAllAdmins("💬 ข้อความ LINE ใหม่\\nข้อความ: " + userMessage);
          return createJsonResponse({status: 'success'});
        }
      }
    }
    return createJsonResponse({error: 'No valid action found'});
  } catch (error) {
    return createJsonResponse({error: error.message});
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const action = e.parameter.action;
  const sheet = getOrCreateSheet('Requests');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  if (action === 'getRequests') {
    const json = rows.map(row => {
      let obj = {};
      headers.forEach((h, i) => {
        let val = row[i];
        obj[h] = val instanceof Date ? val.toISOString() : val;
      });
      return obj;
    }).reverse();
    return createJsonResponse(json);
  }

  if (action === 'getUserRequests') {
    const userId = e.parameter.userId;
    const json = rows
      .filter(row => row[1] === userId)
      .map(row => {
        let obj = {};
        headers.forEach((h, i) => {
          let val = row[i];
          obj[h] = val instanceof Date ? val.toISOString() : val;
        });
        return obj;
      }).reverse();
    return createJsonResponse(json);
  }

  return HtmlService.createHtmlOutput('<h1>LINE OA API v2.6 Active</h1>');
}

function sendPushMessage(userId, text) {
  const url = 'https://api.line.me/v2/bot/message/push';
  UrlFetchApp.fetch(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN },
    payload: JSON.stringify({ to: userId, messages: [{ type: 'text', text: text }] }),
    muteHttpExceptions: true
  });
}

function sendToAllAdmins(text) {
  if (!ADMIN_LINE_USER_IDS || ADMIN_LINE_USER_IDS.length === 0) return;
  const url = 'https://api.line.me/v2/bot/message/multicast';
  const validIds = ADMIN_LINE_USER_IDS.filter(id => id && !id.includes('YOUR_ADMIN_LINE_USER_ID'));
  if (validIds.length === 0) return;
  UrlFetchApp.fetch(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN },
    payload: JSON.stringify({ to: validIds, messages: [{ type: 'text', text: '🔔 แจ้งเตือน\\n' + text }] }),
    muteHttpExceptions: true
  });
}

function replyToUser(userId, text, messageId, adminUsername) {
  sendPushMessage(userId, "🔔 ตอบกลับจากเจ้าหน้าที่:\\n" + text);
  const sheet = getOrCreateSheet('Requests');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == messageId) {
      sheet.getRange(i + 1, 4).setValue('replied');
      sheet.getRange(i + 1, 5).setValue(adminUsername);
      sheet.getRange(i + 1, 6).setValue(text);
      sheet.getRange(i + 1, 8).setValue(new Date());
      break;
    }
  }
  return { success: true };
}
`;
