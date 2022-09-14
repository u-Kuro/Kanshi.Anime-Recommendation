package com.example.kanshi;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NavUtils;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.ConsoleMessage;
import android.webkit.DownloadListener;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.io.Writer;
import java.net.URLDecoder;
import java.text.SimpleDateFormat;
import java.util.Date;

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

        // Import
        // Export
        webView.setDownloadListener(new DownloadListener() {
            public void onDownloadStart(
                String url, String userAgent,
                String contentDisposition, String mimetype,
                long contentLength) {
                try {
                    String json = URLDecoder.decode(url.replace("data:text/json;charset=utf-8,","").replace("+", "%2B"), "UTF-8")
                            .replace("%2B", "+");
                    JSONObject obj = new JSONObject(json);
                    String path = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS) + File.separator;
                    Writer output = null;
                    String date = new SimpleDateFormat("GyyMMddhhmmssMs").format(new Date());
                    File file = new File(path + "Kanshi.-Backup-"+date+".json");
                    output = new BufferedWriter(new FileWriter(file));
                    output.write(obj.toString());
                    output.close();
                    Toast.makeText(getApplicationContext(), "Back-Up was saved in Dowload", Toast.LENGTH_LONG).show();
                } catch (UnsupportedEncodingException | JSONException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });

//        webView.setWebViewClient(new MyWebViewClient());

        // Console Logs for Debugging
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {

                if (mUploadMessage != null) {
                    mUploadMessage.onReceiveValue(null);
                }

                mUploadMessage = filePathCallback;

                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*"); // set MIME type to filter

                MainActivity.this.startActivityForResult(Intent.createChooser(i, "File Chooser"), MainActivity.FILECHOOSER_RESULTCODE );

                return true;
            }
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                String message = consoleMessage.message();
                if("WebtoApp: List is Updated".equals(message)){
                    NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "My Notification")
                            .setContentTitle("Update")
                            .setContentText("Recommendations List has been Updated!")
                            .setSmallIcon(R.drawable.img)
                            .setAutoCancel(true);
                    NotificationManagerCompat managerCompat = NotificationManagerCompat.from(MainActivity.this);
                    managerCompat.notify(1, builder.build());
                }
                else if("WebtoApp: Update Error".equals(message)){
                    NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "My Notification")
                            .setContentTitle("Update")
                            .setContentText("An Error occured, List was not been Updated!")
                            .setSmallIcon(R.drawable.img)
                            .setAutoCancel(true);
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

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent) {

        if (requestCode == FILECHOOSER_RESULTCODE) {

            if (null == mUploadMessage || intent == null || resultCode != RESULT_OK) {
                return;
            }

            Uri[] result = null;
            String dataString = intent.getDataString();

            if (dataString != null) {
                result = new Uri[]{ Uri.parse(dataString) };
            }

            mUploadMessage.onReceiveValue(result);
            mUploadMessage = null;
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