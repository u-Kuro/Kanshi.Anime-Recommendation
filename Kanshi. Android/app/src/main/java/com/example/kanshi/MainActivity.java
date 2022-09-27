package com.example.kanshi;

import static com.example.kanshi.Utils.*;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import android.app.AlertDialog;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.provider.Settings;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.DownloadListener;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.Writer;
import java.net.URLDecoder;

public class MainActivity extends AppCompatActivity {

    private SharedPreferences prefs;
    private SharedPreferences.Editor prefsEdit;

    private final static int CHOOSE_IMPORT_FILE = 1;
    private final static int CHOOSE_EXPORT_PATH = 2;

    private ValueCallback<Uri[]> mUploadMessage;
    private String exportPath;
    private WebView webView;
    public boolean wasInBackground;

    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        // Hide Action Bar
        getSupportActionBar().hide();
        // Shared Preference
        prefs = MainActivity.this.getSharedPreferences("com.example.kanshi", Context.MODE_PRIVATE);
        prefsEdit = prefs.edit();
         // Saved Data
            exportPath = prefs.getString("savedExportPath", "");
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
        webSettings.setRenderPriority(WebSettings.RenderPriority.HIGH);
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
        // Set WebView Settings
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        // Export
        webView.setDownloadListener(new DownloadListener() {
            @RequiresApi(api = Build.VERSION_CODES.R)
            public void onDownloadStart(
                    String url, String userAgent,
                    String contentDisposition, String mimetype,
                    long contentLength) {
                if (!Environment.isExternalStorageManager()) {
                    new AlertDialog.Builder(MainActivity.this)
                        .setTitle("Requires Permission for External Storage")
                        .setMessage("Enable Kanshi. App in the Settings after clicking OK!")
                        .setIcon(android.R.drawable.ic_dialog_alert)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                Uri uri = Uri.parse("package:${BuildConfig.APPLICATION_ID}");
                                Toast.makeText(getApplicationContext(), "Enable Kanshi. App in here to permit Data Export!", Toast.LENGTH_LONG).show();
                                startActivity(new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri));
                            }
                        })
                        .setNegativeButton("Later", null).show();
                } else {
                    if(new File(exportPath).isDirectory()){
                        String directoryPath = exportPath + File.separator;
                        File directory = new File(directoryPath);
                        if (!directory.exists()) {
                            directory.mkdirs();
                        }
                        if (directory.isDirectory()) {
                            try {
                                String json = URLDecoder.decode(url.replace("data:text/json;charset=utf-8,", "").replace("+", "%2B"), "UTF-8")
                                        .replace("%2B", "+");
                                JSONObject obj = new JSONObject(json);
                                String username = obj.has("savedUsername") ? obj.getString("savedUsername") : "Backup";
                                Writer output = null;
                                //String date = new SimpleDateFormat("GyyMMddHH").format(new Date());
                                File file = new File(directoryPath + "Kanshi." + username + ".json");
                                if (file.exists()) {
                                    file.delete();
                                }
                                output = new BufferedWriter(new FileWriter(file));
                                output.write(json);
                                output.close();
                                Toast.makeText(getApplicationContext(), "Data was successfully Exported!", Toast.LENGTH_LONG).show();
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    } else if(exportPath!=""&&!new File(exportPath).isDirectory()){
                        String[] tempExportPath = exportPath.split("/");
                        String tempPathName = tempExportPath.length>1?
                                tempExportPath[tempExportPath.length-2]+"/"+
                                tempExportPath[tempExportPath.length-1]
                                : tempExportPath[tempExportPath.length-1];
                        new AlertDialog.Builder(MainActivity.this)
                            .setTitle("Export Folder is Missing")
                            .setMessage("Folder Directory ["+tempPathName
                                    +"] is missing, Please choose another Folder for Exports...")
                            .setIcon(android.R.drawable.ic_dialog_alert)
                            .setPositiveButton("Choose a Folder", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialogInterface, int x) {
                                    Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
                                            .addCategory(Intent.CATEGORY_DEFAULT);
                                    startActivityForResult(Intent.createChooser(i, "Choose directory"), CHOOSE_EXPORT_PATH);
                                    Toast.makeText(getApplicationContext(), "Select or Create a Directory!", Toast.LENGTH_LONG).show();
                                }
                            })
                            .setNegativeButton("Later", null).show();
                    } else {
                        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
                                .addCategory(Intent.CATEGORY_DEFAULT);
                        startActivityForResult(Intent.createChooser(i, "Choose directory"), CHOOSE_EXPORT_PATH);
                        Toast.makeText(getApplicationContext(), "Select or Create a Directory!", Toast.LENGTH_LONG).show();
                    }
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
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT)
                            .addCategory(Intent.CATEGORY_OPENABLE)
                            .setType("application/json"); // set MIME type to filter
                    startActivityForResult(Intent.createChooser(i, "File Chooser"), CHOOSE_IMPORT_FILE);
                    Toast.makeText(getApplicationContext(), "Please Select your Backup File!", Toast.LENGTH_LONG).show();
                    return true;
                } catch (Exception e){
                    e.printStackTrace();
                    return true;
                }
            }
            // Console Logs for Debugging
            @RequiresApi(api = Build.VERSION_CODES.R)
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                String message = consoleMessage.message();
                int lineNumber = consoleMessage.lineNumber();
                if("WebtoApp: Choose an Export Path".equals(message)){
                    if (!Environment.isExternalStorageManager()) {
                        new AlertDialog.Builder(MainActivity.this)
                            .setTitle("Requires Permission for External Storage")
                            .setMessage("Enable Kanshi. App in the Settings after clicking OK!")
                            .setIcon(android.R.drawable.ic_dialog_alert)
                            .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialogInterface, int i) {
                                    Uri uri = Uri.parse("package:${BuildConfig.APPLICATION_ID}");
                                    Toast.makeText(getApplicationContext(), "Enable Kanshi. App in here to permit Data Export!", Toast.LENGTH_LONG).show();
                                    startActivity(new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri));
                                }
                            })
                            .setNegativeButton("Later", null).show();
                    } else {
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                            Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
                                    .addCategory(Intent.CATEGORY_DEFAULT);
                            startActivityForResult(Intent.createChooser(i, "Choose directory"), CHOOSE_EXPORT_PATH);
                            Toast.makeText(getApplicationContext(), "Select or Create a Directory!", Toast.LENGTH_LONG).show();
                        }
                    }
                } else if("WebtoApp: List is Updated".equals(message)){
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
                } else if(message.contains("WebtoApp: Keep Alive")){
                    String javascript = message.replace("WebtoApp: Keep Alive","");
                    webView.loadUrl("javascript:"+javascript);
                }
                Log.d("WebConsole",message+"-"+lineNumber);
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
            if (requestCode == CHOOSE_IMPORT_FILE) {
                Uri[] result = null;
                if (null == mUploadMessage || intent == null || resultCode != RESULT_OK) {
                    result = new Uri[]{Uri.parse("")};
                } else {
                    String dataString = intent.getDataString();
                    if (dataString != null) {
                        result = new Uri[]{Uri.parse(dataString)};
                    }
                }
                mUploadMessage.onReceiveValue(result);
                mUploadMessage = null;
                return;
            }
            if(requestCode==CHOOSE_EXPORT_PATH){
                if (intent == null || resultCode != RESULT_OK) {return;}
                Uri uri = intent.getData();
                Uri docUri = DocumentsContract.buildDocumentUriUsingTree(uri,
                        DocumentsContract.getTreeDocumentId(uri));
                String path = getPath(this, docUri);
                exportPath = path;
                Toast.makeText(getApplicationContext(), "Export Folder is Selected, you may Export now!", Toast.LENGTH_LONG).show();
                prefsEdit.putString("savedExportPath",exportPath).apply();
                webView.loadUrl("javascript:" +
                        "exportPathIsAvailable=true;" +
                        "saveJSON(exportPathIsAvailable,'exportPathIsAvailable');" +
                        "swal({\n" +
                        "    text: `Do you want to export your data?`,\n" +
                        "    buttons: [\n" +
                        "            'No',\n" +
                        "            'Yes'\n" +
                        "        ],\n" +
                        "                })\n" +
                        ".then(async(confirmed) => {\n" +
                        "    if(confirmed){\n" +
                        "        const savedUsername = await retrieveJSON('savedUsername');\n" +
                        "        const savedHiddenAnimeTitles = await retrieveJSON('savedHiddenAnimeTitles');\n" +
                        "        const savedUserList = await retrieveJSON('savedUserList');\n" +
                        "        const savedAnimeEntries = await retrieveJSON('savedAnimeEntries');\n" +
                        "        const allFilterInfo = await retrieveJSON('allFilterInfo');\n" +
                        "        const savedFilterOptionsJson = await retrieveJSON('savedFilterOptionsJson');\n" +
                        "        const savedRecScheme = await retrieveJSON('savedRecScheme');\n" +
                        "        const savedLatestAnimeTitle = await retrieveJSON('savedLatestAnimeTitle');\n" +
                        "        const savedAnalyzeVariableTime = await retrieveJSON('savedAnalyzeVariableTime');\n" +
                        "        const savedUpdateAnalyzeAnimeTime = await retrieveJSON('savedUpdateAnalyzeAnimeTime');\n" +
                        "        const savedDeepUpdateTime = await retrieveJSON('savedDeepUpdateTime');\n" +
                        "        const lastAnilistPage = await retrieveJSON('lastAnilistPage');\n" +
                        "        const savedAnalyzedVariablesCount = await retrieveJSON('savedAnalyzedVariablesCount');\n" +
                        "        const backup = {\n" +
                        "            savedUsername: savedUsername,\n" +
                        "            savedHiddenAnimeTitles: savedHiddenAnimeTitles,\n" +
                        "            allFilterInfo: allFilterInfo,\n" +
                        "            savedFilterOptionsJson: savedFilterOptionsJson,\n" +
                        "            savedRecScheme: savedRecScheme,\n" +
                        "            savedAnimeEntries: savedAnimeEntries,\n" +
                        "            savedLatestAnimeTitle: savedLatestAnimeTitle,\n" +
                        "            savedUserList: savedUserList,\n" +
                        "            savedAnalyzeVariableTime: savedAnalyzeVariableTime,\n" +
                        "            savedUpdateAnalyzeAnimeTime: savedUpdateAnalyzeAnimeTime,\n" +
                        "            savedDeepUpdateTime: savedDeepUpdateTime,\n" +
                        "            lastAnilistPage: lastAnilistPage,\n" +
                        "            savedAnalyzedVariablesCount: savedAnalyzedVariablesCount\n" +
                        "        };\n" +
                        "        downloadObjectAsJson(backup,'Kanshi-Backup');\n" +
                        "        $('.menu-container').fadeOut(250);\n" +
                        "    }\n" +
                        "});"
                    );
            }
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }
    }

    @Override
    public void onPause(){
        super.onPause();
        webView.resumeTimers();
        webView.setNetworkAvailable(true);
        webView.onResume();
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
    public void onBackPressed() {
        // Add Do you want to exit Confirmation
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            new AlertDialog.Builder(this)
                    .setTitle("Hey hey...")
                    .setMessage("Do you really want to Exit now?")
                    .setIcon(android.R.drawable.ic_dialog_alert)
                    .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
                            finish();
                            overridePendingTransition(com.google.android.material.R.anim.abc_fade_in, com.google.android.material.R.anim.abc_fade_out);
                        }
                    })
                    .setNegativeButton("Later", null).show();
        }
    }
}