import * as dotenv from "dotenv";
import {promises as fs} from 'fs';
import {PDFDocument} from 'pdf-lib';
import * as path from 'path';

import {LlamaParseReader} from "llamaindex";

async function saveMarkdown(mdContent: string, filePath: string) {
    try {
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, {recursive: true});
        await fs.writeFile(filePath, mdContent, 'utf8');
        console.log(`Markdown file has been saved to: ${filePath}`);
    } catch (error) {
        console.error('Error saving Markdown file:', error);
    }
}

async function mergeMarkdownFiles(folderPath: string, outputFile: string): Promise<void> {
    try {
        // 读取文件夹中的所有文件
        const files = await fs.readdir(folderPath);

        // 过滤出 .md 文件
        const mdFiles = files.filter(file => path.extname(file) === '.md');

        if (mdFiles.length === 0) {
            console.log('文件夹中没有找到 .md 文件');
            return;
        }

        // 初始化内容数组
        const mergedContent: string[] = [];

        // 异步读取每个 .md 文件的内容
        for (const file of mdFiles) {
            const filePath = path.join(folderPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            mergedContent.push(content);
        }

        // 使用分隔符合并内容
        const finalContent = mergedContent.join('\n\n---\n\n');

        // 将合并后的内容写入输出文件
        await fs.writeFile(outputFile, finalContent, 'utf-8');

        console.log(`所有 .md 文件已合并到 ${outputFile}`);
    } catch (error) {
        console.error('发生错误:', error);
    }
}

async function splitPDF(pdfPath: string): Promise<void> {
    try {
        const folderPath: string = "temp"
        await fs.access(folderPath).catch(async () => {
            // 如果文件夹不存在，则创建
            await fs.mkdir(folderPath, {recursive: true});
            console.log(`Folder "${folderPath}" created.`);
        });

        // 读取文件夹内容
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const fullPath = path.join(folderPath, file);
            const stat = await fs.lstat(fullPath);

            // 判断是文件还是文件夹
            if (stat.isDirectory()) {
                // 递归删除子文件夹
                await fs.rm(fullPath, {recursive: true, force: true});
                console.log(`Deleted folder: ${fullPath}`);
            } else {
                // 删除文件
                await fs.unlink(fullPath);
                console.log(`Deleted file: ${fullPath}`);
            }
        }

        // 读取 PDF 文件
        const pdfBytes = await fs.readFile(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // 获取 PDF 页数
        const pageCount = pdfDoc.getPageCount();
        console.log(`Total pages: ${pageCount}`);

        for (let i = 0; i < pageCount; i++) {
            // 创建新的 PDF 文档
            const newPdf = await PDFDocument.create();
            const [page] = await newPdf.copyPages(pdfDoc, [i]);
            newPdf.addPage(page);

            // 保存新 PDF
            const newPdfBytes = await newPdf.save();
            const fileIndex = (i + 1).toString().padStart(4, '0');
            const outputPath = `temp/page-${fileIndex}.pdf`;
            await fs.writeFile(outputPath, newPdfBytes);

            console.log(`Saved page ${fileIndex} to ${outputPath}`);
        }
    } catch (error) {
        console.error(`Error splitting PDF: ${error}`);
    }
}

const splitAndParse = async (filePath: string) => {
    await splitPDF(filePath)
    const folderPath = "temp"
    const fileName = path.basename(filePath, path.extname(filePath));
    const reader = new LlamaParseReader({resultType: "markdown"});
    const files = await fs.readdir(folderPath);
    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        const tempName = path.basename(file, path.extname(file));
        const documents = await reader.loadData(fullPath)
        await saveMarkdown(documents[0].text, `${fileName}/${tempName}.md`)
    }
    await mergeMarkdownFiles(`${fileName}`, `${fileName}.md`)
}

async function main() {
    dotenv.config();

    const filePath = process.env.FILE_PATH;
    if (filePath) {
        const folderPath = "temp"
        const fileName = path.basename(filePath, path.extname(filePath));
        const reader = new LlamaParseReader({resultType: "markdown"});
        const files = await fs.readdir(folderPath);
        for (const file of files) {
            const fullPath = path.join(folderPath, file);
            const tempName = path.basename(file, path.extname(file));
            const documents = await reader.loadData(fullPath)
            await saveMarkdown(documents[0].text, `${fileName}/${tempName}.md`)
        }
        await mergeMarkdownFiles(`${fileName}`, `${fileName}.md`)
    }
}

main().catch(console.error);