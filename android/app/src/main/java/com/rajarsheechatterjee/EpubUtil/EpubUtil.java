package com.rajarsheechatterjee.EpubUtil;

import android.util.Xml;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Objects;

public class EpubUtil extends ReactContextBaseJavaModule {
    EpubUtil(ReactApplicationContext context){super(context);}

    @NonNull
    @Override
    public String getName() {
        return "EpubUtil";
    }

    private XmlPullParser initParse(File file) throws XmlPullParserException, IOException {
        XmlPullParser parser = Xml.newPullParser();
        parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, false);
        parser.setInput(new FileInputStream(file), null);
        parser.nextTag();
        return parser;
    }

    private String readText(XmlPullParser parser) throws IOException, XmlPullParserException {
        String result = "";
        if (parser.next() == XmlPullParser.TEXT) {
            result = parser.getText();
            parser.nextTag();
        }
        return result;
    }

    @ReactMethod
    public void parseNovelAndChapters(String epubDirPath, Promise promise) {
        try {
            File containerFile = new File(epubDirPath, "META-INF/container.xml");
            File contentMetaFile = new File(epubDirPath, getContentMetaFilePath(containerFile));
            String contentDir = contentMetaFile.getParent();

            ReadableMap novel = getNovelMetadata(contentMetaFile, contentDir);
            promise.resolve(novel);
        } catch (XmlPullParserException | IOException e) {
            promise.reject(e.getCause());
        }
    }

    private String getContentMetaFilePath(File file) throws XmlPullParserException, IOException {
        XmlPullParser parser = initParse(file);
        parser.require(XmlPullParser.START_TAG, null, "container");
        while (parser.next() != XmlPullParser.END_TAG){
            if (parser.getEventType() != XmlPullParser.START_TAG) {
                continue;
            }
            if(parser.getName().equals("rootfile")) {
                return parser.getAttributeValue(null, "full-path");
            }
        }
        return "OEBPS/content.opf"; // default
    }
    private ReadableMap getNovelMetadata(File file, String contentDir) throws XmlPullParserException, IOException {
        WritableMap novel = new WritableNativeMap();
        WritableArray chapters = new WritableNativeArray();
        XmlPullParser parser = initParse(file);
        HashMap<String, String> refMap = new HashMap<>();
        HashMap<String, String> tocMap = new HashMap<>();
        File tocFile = new File(contentDir, "toc.ncx");
        if(tocFile.exists()){
            XmlPullParser tocParser = initParse(tocFile);
            String label = null;
            while (tocParser.next() != XmlPullParser.END_DOCUMENT){
                String tag = tocParser.getName();
                if(tag != null){
                    if(tag.equals("text")){
                        label = readText(tocParser);
                    }else if(tag.equals("content")){
                        String href = tocParser.getAttributeValue(null, "src");
                        if(href != null){
                            tocMap.put(href, label);
                        }
                    }
                }
            }
        }
        String cover = null;
        while (parser.next() != XmlPullParser.END_DOCUMENT){
            @Nullable String tag = parser.getName();
            if(tag != null){
                if(tag.endsWith("item")){
                    String id = parser.getAttributeValue(null, "id");
                    String href = parser.getAttributeValue(null, "href");
                    if(id != null){
                        refMap.put(id, href);
                    }
                } else if (tag.endsWith("itemref")) {
                    String idRef = parser.getAttributeValue(null, "idref");
                    String href = refMap.get(idRef);
                    if(href != null){
                        WritableMap chapter = new WritableNativeMap();
                        chapter.putString("path", contentDir + "/" + href);
                        String name = tocMap.get(href);
                        chapter.putString("name", name == null ? href : name);
                        chapters.pushMap(chapter);
                    }
                } else if(tag.equals("dc:title")){
                    novel.putString("name", readText(parser));
                } else if (tag.equals("dc:creator")) {
                    novel.putString("author", readText(parser));
                } else if (tag.equals("dc:description")) {
                    novel.putString("summary", readText(parser));
                } else if (tag.endsWith("meta") && parser.getAttributeValue(null, "name").equals("cover")) {
                    cover = parser.getAttributeValue(null, "content");
                }
                parser.next();
            }
        }
        if(cover != null){
            String coverPath = contentDir + "/" + refMap.get(cover);
            novel.putString("cover", coverPath);
        }
        novel.putArray("chapters", chapters);
        return novel;
    }
}
