package com.rajarsheechatterjee.ZipArchive;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public class ZipArchive extends ReactContextBaseJavaModule {
    ZipArchive(ReactApplicationContext context) throws Exception {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "ZipArchive";
    }

    private String escapeFilePath(String filePath){
        return filePath.replaceAll(":", "\uA789");
    }

    private void unzipProcess(ZipInputStream zis, String distDirPath) throws Exception {
        ZipEntry zipEntry;
        int len;
        byte[] buffer = new byte[4096];
        while ((zipEntry = zis.getNextEntry()) != null) {
            String escapedFilePath = this.escapeFilePath(zipEntry.getName());
            File newFile = new File(distDirPath, escapedFilePath);
            newFile.getParentFile().mkdirs();
            FileOutputStream fos = new FileOutputStream(newFile);
            boolean isWritten = false; // ignore folder entry;
            while ((len = zis.read(buffer)) > 0) {
                isWritten = true;
                fos.write(buffer, 0, len);
            }
            fos.close();
            if(!isWritten) newFile.delete();
        }
        zis.closeEntry();
        zis.close();
    }
    @ReactMethod
    public void unzip(String sourceFilePath, String distDirPath, Promise promise) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try{
                    ZipInputStream zis = new ZipInputStream(new FileInputStream(sourceFilePath));
                    unzipProcess(zis, distDirPath);
                    promise.resolve(null);
                } catch (Exception e) {
                    promise.reject(e.getCause());
                }
            }
        }).start();
    }

    @ReactMethod
    public void remoteUnzip(String distDirPath, String _url, @Nullable ReadableMap headers, Promise promise){
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    URL url = new URL(_url);
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    if(headers != null){
                        Iterator<Map.Entry<String, Object>> it = headers.getEntryIterator();
                        while (it.hasNext()){
                            Map.Entry<String, Object> entry = it.next();
                            connection.setRequestProperty(entry.getKey(), entry.getValue().toString());
                        }
                    }
                    ZipInputStream zis = new ZipInputStream(connection.getInputStream());
                    unzipProcess(zis, distDirPath);
                    if(connection.getResponseCode() == 200){
                        connection.disconnect();
                        promise.resolve(null);
                    }else{
                        throw new Exception("Net work request failed");
                    }
                }catch (Exception e){
                    promise.reject(e.getCause());
                }
            }
        }).start();
    }

    private ArrayList<String> walkDir(String path) {
        ArrayList<String> res = new ArrayList<>();
        File node = new File(path);
        if(node.isFile()){
            res.add(path);
        }else{
            String[] children = node.list();
            if(children != null){
                for(String filename: children){
                    ArrayList<String> childPaths = walkDir(new File(path, filename).toString());
                    res.addAll(childPaths);
                }
            }
        }
        return res;
    }
    private void zipProcess(String sourceDirPath, ZipOutputStream zos) throws Exception{
        ArrayList<String> paths = walkDir(sourceDirPath);
        byte[] buffer = new byte[4096];
        int len;
        for(String path: paths){
            ZipEntry zipEntry = new ZipEntry(path.replace(sourceDirPath + "/", ""));
            zos.putNextEntry(zipEntry);
            try (FileInputStream fis = new FileInputStream(path)) {
                while ((len = fis.read(buffer)) > 0) {
                    zos.write(buffer, 0, len);
                }
            }
            zos.closeEntry();
        }
        zos.close();
    }
    @ReactMethod
    public void remoteZip(String sourceDirPath, String _url, @Nullable ReadableMap headers, Promise promise){
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    URL url = new URL(_url);
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    connection.setRequestMethod("POST");
                    if(headers != null){
                        Iterator<Map.Entry<String, Object>> it = headers.getEntryIterator();
                        while (it.hasNext()){
                            Map.Entry<String, Object> entry = it.next();
                            connection.setRequestProperty(entry.getKey(), entry.getValue().toString());
                        }
                    }
                    ZipOutputStream zos = new ZipOutputStream(connection.getOutputStream());
                    zipProcess(sourceDirPath, zos);
                    if(connection.getResponseCode() == 200){
                        connection.disconnect();
                        promise.resolve(null);
                    }else{
                        throw new Exception("Net work request failed");
                    }
                }catch (Exception e){
                    promise.reject(e.getCause());
                }
            }
        }).start();
    }
}
