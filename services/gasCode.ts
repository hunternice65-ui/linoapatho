
export const CODE_GS = `/**
 * ==============================================================================
 * LINE OA Internal Request System (v2.8)
 * ==============================================================================
 */

// --- ตั้งค่าระบบตรงนี้ (ต้องกำหนดค่าให้ถูกต้อง) ---
var CHANNEL_ACCESS_TOKEN = 'ej7BKKcnSBmZ8rjthBBckrj+DHOVG7ikC7xaP5dwC0a7f3Ehj/hsoJwSI1ECBQ05Yeo/W7qt96WAQVKLJ3BJgaVR/h7ETGTgECf3H7GrrlFMhmUS97pwI29SAS0umcna0NHu98hBTiolCi8oB/CwPQdB04t89/1O/w1cDnyilFU='; 
var ADMIN_LINE_USER_IDS = ['Ufe0c7b62214f28847e54440cb58e7267']; // ใส่ User ID ของ Admin ในอาร์เรย์นี้
var MY_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyZFth_laMfnFkWCWFX9Q03Q0WS7AyiCLfzbskCFNk6x4p2GFAZhHy1QJuDOcE8Dp3N/exec';

var HEADERS = ['id', 'lineUserId', 'message', 'status', 'assignedTo', 'reply', 'createdAt', 'repliedAt', 'source', 'contactInfo', 'subject'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var postData;
    try {
      postData = e.postData ? JSON.parse(e.postData.contents) : {};
    } catch(f) { postData = {}; }

    var action = e.parameter.action || postData.action;
    
    if (action === 'reply') {
      var res = replyToUser(
        e.parameter.userId || postData.userId, 
        e.parameter.text || postData.text, 
        e.parameter.messageId || postData.messageId, 
        e.parameter.admin || postData.admin
      );
      return createJsonResponse(res);
    }

    if (action === 'submitForm') {
      var sheet = getOrCreateSheet('Requests');
      var id = 'FORM-' + new Date().getTime();
      var subject = postData.subject || 'คำขอใช้บริการ';
      var contact = postData.contact || '-';
      var message = postData.message || '-';
      var lineUid = postData.lineUserId || 'DIRECT_WEB_USER';
      
      sheet.appendRow([id, lineUid, message, 'new', '', '', new Date(), '', 'form', contact, subject]);
      
      // 1. ส่งแจ้งเตือนหา Admin
      sendToAllAdmins("📝 มีฟอร์มใหม่เข้ามา!\\nเรื่อง: " + subject + "\\nผู้ติดต่อ: " + contact + "\\nรายละเอียด: " + message);
      
      // 2. ส่งข้อความยืนยันหาผู้ใช้ (ถ้ามี LINE ID)
      if (lineUid && lineUid !== 'DIRECT_WEB_USER' && lineUid.indexOf('U') === 0) {
        sendPushMessage(lineUid, "✅ ได้รับข้อมูลการแจ้งเรื่อง [" + subject + "] ของคุณเรียบร้อยแล้ว\\nเจ้าหน้าที่จะดำเนินการตรวจสอบโดยเร็วที่สุด");
      }
      
      return createJsonResponse({success: true, id: id});
    }

    if (e.postData && e.postData.contents && !action) {
      var data = JSON.parse(e.postData.contents);
      if (data.events && data.events.length > 0) {
        var event = data.events[0];
        var senderId = event.source.userId;

        if (event.type === 'follow') {
          sendPushMessage(senderId, "ยินดีต้อนรับสู่ระบบแจ้งบริการภายใน\\n\\nคลิกที่นี่เพื่อแจ้งเรื่อง:\\n" + MY_WEB_APP_URL + "?userId=" + senderId + "&view=form");
          return createJsonResponse({status: 'ok'});
        }

        if (event.type === 'message' && event.message.type === 'text') {
          var sheet = getOrCreateSheet('Requests');
          var messageId = event.message.id;
          var userMessage = event.message.text;
          sheet.appendRow([messageId, senderId, userMessage, 'new', '', '', new Date(), '', 'line', '', 'LINE Message']);
          sendToAllAdmins("💬 ข้อความใหม่จาก LINE\\nจาก ID: " + senderId.substring(0,8) + "...\\nข้อความ: " + userMessage);
          return createJsonResponse({status: 'success'});
        }
      }
    }
    return createJsonResponse({error: 'Invalid action'});
  } catch (error) {
    return createJsonResponse({error: error.message});
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var action = e.parameter.action;
  var sheet = getOrCreateSheet('Requests');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1);

  if (action === 'getRequests') {
    var json = rows.map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) {
        var val = row[i];
        obj[h] = val instanceof Date ? val.toISOString() : val;
      });
      return obj;
    }).reverse();
    return createJsonResponse(json);
  }

  if (action === 'getUserRequests') {
    var userId = e.parameter.userId;
    var json = rows
      .filter(function(row) { return row[1] === userId; })
      .map(function(row) {
        var obj = {};
        headers.forEach(function(h, i) {
          var val = row[i];
          obj[h] = val instanceof Date ? val.toISOString() : val;
        });
        return obj;
      }).reverse();
    return createJsonResponse(json);
  }

  return HtmlService.createHtmlOutput('<h1>LINE OA API v2.8 Active</h1>');
}

function sendToAllAdmins(text) {
  if (typeof ADMIN_LINE_USER_IDS === 'undefined' || !ADMIN_LINE_USER_IDS || ADMIN_LINE_USER_IDS.length === 0) return;
  
  // กรองเฉพาะ ID ที่น่าจะถูกต้อง
  var validIds = ADMIN_LINE_USER_IDS.filter(function(id) { 
    return id && id.length > 10 && id.indexOf('U') === 0; 
  });
  
  if (validIds.length === 0) return;

  var url = 'https://api.line.me/v2/bot/message/multicast';
  UrlFetchApp.fetch(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN },
    payload: JSON.stringify({ to: validIds, messages: [{ type: 'text', text: '🔔 [ADMIN ALERT]\\n' + text }] }),
    muteHttpExceptions: true
  });
}

function sendPushMessage(userId, text) {
  var url = 'https://api.line.me/v2/bot/message/push';
  UrlFetchApp.fetch(url, {
    method: 'post',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN },
    payload: JSON.stringify({ to: userId, messages: [{ type: 'text', text: text }] }),
    muteHttpExceptions: true
  });
}

function replyToUser(userId, text, messageId, adminUsername) {
  sendPushMessage(userId, "📢 ตอบกลับจาก " + adminUsername + ":\\n" + text);
  var sheet = getOrCreateSheet('Requests');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
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

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
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
`;
