const fs = require('fs');
const path = require('path');

// 1. 最新の data.json の読み込み
const jsonPath = path.join(__dirname, 'data.json');
if (!fs.existsSync(jsonPath)) {
    console.error('Error: data.json が見つかりません。先にGASからダウンロードしてください。');
    process.exit(1);
}
const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// ヘッダー行とデータ行を分解
const headers = rawData[0];
const rows = rawData.slice(1);

// 列名からインデックスへのマッピングを作成（スプレッドシートの列順変更に強くなります）
const colMap = {};
headers.forEach((name, index) => { colMap[name] = index; });

let htmlRows = '';

// 2. データのHTML（<tr>）を正確に生成
rows.forEach((row, i) => {
    // 必須データの抽出（無ければ空文字やデフォルト値を設定）
    const id = row[colMap['ID']] || `grant_${i}`; 
    const org = row[colMap['機関名等']] || '';
    const title = row[colMap['助成金名等']] || '';
    const url = row[colMap['URL']] || '#';
    const deadline = row[colMap['〆切']] || '';
    const amountText = row[colMap['金額']] || '';
    const amountNum = row[colMap['金額(数値)']] || 0; // DataTablesソート用の純粋な数値
    const tagsRaw = row[colMap['タグ']] || '';
    const updateDate = row[colMap['更新日']] || '';

    // タグをバッジ化
    const tagBadges = tagsRaw ? tagsRaw.split(/[,，、\s]+/).filter(t => t).map(t => {
        return `<span class="tag-badge">${t.trim()}</span>`;
    }).join('') : '';

    // template.html の 8列ヘッダー構造と完全に一致する <tr> を作成
    htmlRows += `
        <tr data-id="${id}">
          <td class="col-fav"><button class="fav-btn" data-id="${id}"><i class="fa-regular fa-star"></i></button></td>
          <td class="col-viewed"><button class="viewed-btn" data-id="${id}"><i class="fa-solid fa-check"></i></button></td>
          <td class="col-org">${org}</td>
          <td class="col-grant"><a href="${url}" target="_blank" class="grant-link">${title}</a></td>
          <td class="col-deadline">${deadline}</td>
          <td class="col-amount" data-order="${amountNum}">${amountText}</td>
          <td class="col-tags">${tagBadges}</td>
          <td class="col-update">${updateDate}</td>
        </tr>`;
});

// 3. 型紙（template.html）を読み込んで置換処理を行う
const templatePath = path.join(__dirname, 'template.html');
if (!fs.existsSync(templatePath)) {
    console.error('Error: template.html が見つかりません。先に作成してください。');
    process.exit(1);
}
const templateHtml = fs.readFileSync(templatePath, 'utf8');

// 型紙の目印部分を生成したHTMLデータに置換
const finalHtml = templateHtml.replace('', htmlRows);

// 4. 完成した結果を index.html として上書き出力
fs.writeFileSync(path.join(__dirname, 'index.html'), finalHtml, 'utf8');
console.log('Success: 新しい静的 index.html が正常に生成されました！');
