const fs = require('fs');
const path = require('path');

// 1. ファイルのパスを設定
const jsonPath = path.join(__dirname, 'data.json');
const templatePath = path.join(__dirname, 'template.html');
const outputPath = path.join(__dirname, 'index.html');

try {
    // 2. data.json と template.html を読み込む
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const jsonData = JSON.parse(rawData);
    let template = fs.readFileSync(templatePath, 'utf8');

    // 3. JSONデータからHTMLの行（tr/td）を組み立てる
    let rowsHtml = '';
    
    // 1行目はヘッダー["機関名", "助成金名"...] なので、2行目（インデックス1）から処理
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // 各列のデータを取得（必要に応じて順番を調整してください）
        const organ = row[0] || ''; // 機関名
        const name = row[1] || '';  // 助成金名
        const url = row[2] || '';   // URL
        const deadline = row[3] || ''; // 〆切
        const minAmount = row[4] || ''; // 下限
        const maxAmount = row[5] || ''; // 上限
        const tag = row[6] || ''; // タグ
        
        // リンク付きの助成金名にする場合
        const nameTd = url ? `<td><a href="${url}" target="_blank">${name}</a></td>` : `<td>${name}</td>`;

        rowsHtml += `<tr>
            <td>${organ}</td>
            ${nameTd}
            <td>${deadline}</td>
            <td>${minAmount}</td>
            <td>${maxAmount}</td>
            <td>${tag}</td>
        </tr>\n`;
    }

    // 4. テンプレートの目印部分を、作成したHTML行に置き換える
    const finalHtml = template.replace('', rowsHtml);

    // 5. index.html として書き出す
    fs.writeFileSync(outputPath, finalHtml, 'utf8');
    console.log('✅ index.html が正常に自動生成されました！');

} catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
}
