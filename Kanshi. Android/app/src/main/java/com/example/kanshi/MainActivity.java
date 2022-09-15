package com.example.kanshi;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import android.app.AlertDialog;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.DownloadListener;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.net.URLDecoder;

public class MainActivity extends AppCompatActivity {

    private final static int FILECHOOSER_RESULTCODE = 1;
    private ValueCallback<Uri[]> mUploadMessage;
    private WebView webView;

    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        getSupportActionBar().hide();
        // Create WebView App Instance
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        webView = findViewById(R.id.webView);
        // Set WebView Settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            webSettings.setAllowUniversalAccessFromFileURLs(true);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("My Notification","My Notification", NotificationManager.IMPORTANCE_DEFAULT);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
        if (!DetectConnection.checkInternetConnection(this)) {
            webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        }

        // Export
        webView.setDownloadListener(new DownloadListener() {
            public void onDownloadStart(
                    String url, String userAgent,
                    String contentDisposition, String mimetype,
                    long contentLength) {
                try {
                    String directoryPath = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)+File.separator+"Kanshi."+File.separator;
                    File directory = new File(directoryPath);
                    if (!directory.exists()) {
                        Log.d("DirCreate", String.valueOf(directory.canWrite()));
                        directory.mkdirs();
                    }
                    if(directory.isDirectory()) {
                        String json = URLDecoder.decode(url.replace("data:text/json;charset=utf-8,", "").replace("+", "%2B"), "UTF-8")
                                .replace("%2B", "+");
                        JSONObject obj = new JSONObject(json);
                        Writer output = null;
                        //String date = new SimpleDateFormat("GyyMMddHH").format(new Date());
                        File file = new File(directoryPath +"Kanshi.-"+ obj.getString("savedUsername")+".json");
                        if (file.exists()) {
                            file.delete();
                        }
                        output = new BufferedWriter(new FileWriter(file));
                        output.write(obj.toString());
                        output.close();
                        Toast.makeText(getApplicationContext(), "Data was successfully Exported!", Toast.LENGTH_LONG).show();
                    }
                } catch (UnsupportedEncodingException | JSONException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            // Import
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                try {
                    if (mUploadMessage != null) {
                        mUploadMessage.onReceiveValue(null);
                    }
                    mUploadMessage = filePathCallback;
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("application/json"); // set MIME type to filter
                    MainActivity.this.startActivityForResult(Intent.createChooser(i, "File Chooser"), MainActivity.FILECHOOSER_RESULTCODE);
                    return true;
                } catch (Exception e){
                    e.printStackTrace();
                    return true;
                }
            }
            // Console Logs for Debugging
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                String message = consoleMessage.message();
                if("WebtoApp: List is Updated".equals(message)){
                    NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "My Notification")
                            .setContentTitle("Update")
                            .setContentText("Recommendations List has been Updated!")
                            .setSmallIcon(R.drawable.img)
                            .setAutoCancel(true)
                            .setPriority(NotificationCompat.PRIORITY_MAX);
                    NotificationManagerCompat managerCompat = NotificationManagerCompat.from(MainActivity.this);
                    managerCompat.notify(1, builder.build());
                } else if("WebtoApp: Update Error".equals(message)){
                    NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "My Notification")
                            .setContentTitle("Update")
                            .setContentText("An Error occured, List was not been Updated!")
                            .setSmallIcon(R.drawable.img)
                            .setAutoCancel(true)
                            .setPriority(NotificationCompat.PRIORITY_MAX);
                    NotificationManagerCompat managerCompat = NotificationManagerCompat.from(MainActivity.this);
                    managerCompat.notify(1, builder.build());
                }
                Log.d("WebConsole",message);
                return true;
            }
        });

        // Load the Saved/Page
        if (savedInstanceState != null){
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl("file:///android_asset/www/index.html");
        }
    }

    // Activity Results
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {
        super.onActivityResult(requestCode, resultCode, intent);
        try{
            if (requestCode == FILECHOOSER_RESULTCODE) {
                if (null == mUploadMessage || intent == null || resultCode != RESULT_OK) {
                    return;
                }
                Uri[] result = null;
                String dataString = intent.getDataString();
                if (dataString != null) {
                    result = new Uri[]{Uri.parse(dataString)};
                }
                mUploadMessage.onReceiveValue(result);
                mUploadMessage = null;
                return;
            }
        } catch (Exception e){
            e.printStackTrace();
            return;
        }
    }

    // Save App States
    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }
    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        webView.restoreState(savedInstanceState);
    }

    // Go Back Button
    @Override
    public void onBackPressed(){
        // Add Do you want to exit Confirmation
        if(webView.canGoBack()){
            webView.goBack();
        } else {
            new AlertDialog.Builder(this)
                .setTitle("Hey hey...")
                .setMessage("⠀Do you really want to Exit now?")
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        finish();
                        overridePendingTransition(com.google.android.material.R.anim.abc_fade_in,com.google.android.material.R.anim.abc_fade_out);
                    }
                })
                .setNegativeButton("Later", null).show();
        }
    }
}