package com.rajarsheechatterjee.EpubUtil

import android.util.Xml
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.bridge.WritableNativeMap
import org.xmlpull.v1.XmlPullParser
import java.io.File
import java.io.FileInputStream

class EpubUtil(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    override fun getName(): String {
        return "EpubUtil"
    }

    private fun initParse(file: File): XmlPullParser {
        val parser = Xml.newPullParser()
        parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, true)
        parser.setInput(FileInputStream(file), null)
        parser.nextTag()
        return parser
    }

    private fun readText(parser: XmlPullParser): String {
        var result = ""
        if (parser.next() == XmlPullParser.TEXT) {
            result = parser.text
            parser.nextTag()
        }
        return result
    }

    private fun cleanUrl(url: String): String {
        return url.replaceFirst("#[^.]+?$".toRegex(), "")
    }

    @ReactMethod
    fun parseNovelAndChapters(epubDirPath: String, promise: Promise) {
        try {
            val containerFile = File(epubDirPath, "META-INF/container.xml")
            val contentMetaFile = File(epubDirPath, getContentMetaFilePath(containerFile))
            val contentDir = contentMetaFile.parent
            val novel = contentDir?.let { getNovelMetadata(contentMetaFile, it) }
            promise.resolve(novel)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    private fun getContentMetaFilePath(file: File): String {
        val parser = initParse(file)
        while (parser.next() != XmlPullParser.END_TAG) {
            val tag = parser.name
            if (tag != null && tag == "rootfile") {
                return parser.getAttributeValue(null, "full-path")
            }
        }
        return "OEBPS/content.opf" // default
    }

    private fun mergeChapter(sourceChapter: File, desChapter: File) {
        desChapter.appendBytes(sourceChapter.readBytes())
    }

    private fun getNovelMetadata(file: File, contentDir: String): ReadableMap {
        val novel: WritableMap = WritableNativeMap()
        val chapters: WritableArray = WritableNativeArray()
        val parser = initParse(file)
        val refMap = HashMap<String, String>()
        val entryList = mutableListOf<ChapterEntry>()
        val tocFile = File(contentDir, "toc.ncx")
        if (tocFile.exists()) {
            val tocParser = initParse(tocFile)
            var label = ""
            while (tocParser.next() != XmlPullParser.END_DOCUMENT) {
                val tag = tocParser.name
                if (tag != null) {
                    if (tag == "text") {
                        label = readText(tocParser)
                    } else if (tag == "content") {
                        val href = cleanUrl(tocParser.getAttributeValue(null, "src"))
                        if(label.isNotBlank()){
                            entryList.add(ChapterEntry(name = label, href = href))
                        }
                        label = ""
                    }
                }
            }
        }else{
            throw Error("Table of content doesn't exist!")
        }
        var cover: String? = null
        var entryIndex = 0
        val startChapter = WritableNativeMap()
        startChapter.putString("name", entryList[0].name)
        startChapter.putString("path", "$contentDir/${entryList[0].href}")
        chapters.pushMap(startChapter)
        while (parser.next() != XmlPullParser.END_DOCUMENT) {
            val tag = parser.name
            if (tag != null) {
                when (tag) {
                    "item" -> {
                        val id = parser.getAttributeValue(null, "id")
                        val href = parser.getAttributeValue(null, "href")
                        if (id != null) {
                            refMap[id] = href
                        }
                    }
                    "itemref" -> {
                        val idRef = parser.getAttributeValue(null, "idref")
                        val href = refMap[idRef]
                        val chapterFile = File("$contentDir/$href")
                        if (href != null && chapterFile.exists()) {
                            if (entryIndex < entryList.size - 1 && entryList[entryIndex + 1].href == href) {
                                val newChapter = WritableNativeMap()
                                newChapter.putString("path", chapterFile.path)
                                newChapter.putString("name", entryList[entryIndex + 1].name)
                                chapters.pushMap(newChapter)
                                entryIndex += 1
                            }else{
                                if (href == entryList[entryIndex].href){
                                    continue
                                }
                                mergeChapter(chapterFile, File("$contentDir/${entryList[entryIndex].href}"))
                            }
                        }
                    }

                    "title" -> novel.putString("name", readText(parser))
                    "creator" -> novel.putString("author", readText(parser))
                    "contributor" -> novel.putString("artist", readText(parser))
                    "description" -> novel.putString("summary", readText(parser))
                    "meta" -> {
                        val metaName = parser.getAttributeValue(null, "name")
                        if (metaName != null && metaName == "cover") {
                            cover = parser.getAttributeValue(null, "content")
                        }
                    }
                }
                parser.next()
            }
        }
        if (cover != null) {
            val coverPath = contentDir + "/" + refMap[cover]
            novel.putString("cover", coverPath)
        } else {
            // try scanning Images dir if exists
            val imageDir = File("$contentDir/Images")
            if(imageDir.exists() && imageDir.isDirectory){
                imageDir.listFiles()?.forEach { img ->
                    if (img.isFile && img.name.lowercase().contains("cover|illus".toRegex())){
                        cover = img.path
                    }
                }
            }
            if (cover != null){
                novel.putString("cover", cover)
            }
        }
        novel.putArray("chapters", chapters)
        return novel
    }
}
