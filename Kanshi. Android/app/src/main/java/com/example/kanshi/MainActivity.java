package com.example.kanshi;

import static com.example.kanshi.Utils.*;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import android.app.AlertDialog;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.PowerManager;
import android.provider.DocumentsContract;
import android.provider.Settings;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.LinearLayout;
import android.widget.Toast;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

public class MainActivity extends AppCompatActivity  {

    private SharedPreferences prefs;
    private SharedPreferences.Editor prefsEdit;

    private final static int CHOOSE_IMPORT_FILE = 1;
    private final static int CHOOSE_EXPORT_PATH = 2;

    private ValueCallback<Uri[]> mUploadMessage;
    private String exportPath;
    private MediaWebView webView;

    private PowerManager.WakeLock wakeLock;

    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        // Keep Awake on Lock Screen
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "KeepAwake:");
        wakeLock.acquire();
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
        // Add Webview on Layout
        ConstraintLayout constraintLayout = findViewById(R.id.activity_main);
        webView = new MediaWebView(MainActivity.this);
        webView.setId(R.id.webView);
        constraintLayout.addView(webView);
        // Add Webview Layout Style
        webView.setLayoutParams(new ConstraintLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
        ));
        ConstraintSet constraintSet = new ConstraintSet();
        constraintSet.clone(constraintLayout);
        constraintSet.connect(webView.getId(),ConstraintSet.BOTTOM,ConstraintSet.PARENT_ID,ConstraintSet.BOTTOM,0);
        constraintSet.connect(webView.getId(),ConstraintSet.END,ConstraintSet.PARENT_ID,ConstraintSet.END,0);
        constraintSet.connect(webView.getId(),ConstraintSet.START,ConstraintSet.PARENT_ID,ConstraintSet.START,0);
        constraintSet.applyTo(constraintLayout);
        // Set WebView Settings
        webView.setKeepScreenOn(true);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setLoadsImagesAutomatically(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setBlockNetworkLoads(false);
        webSettings.setBlockNetworkImage(false);
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
        // Add Bridge to Webview
        webView.addJavascriptInterface(new JSBridge(),"JSBridge");
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
                    Intent resultIntent = new Intent(MainActivity.this, MainActivity.class);
                    PendingIntent resultPendingIntent = PendingIntent.getActivity(MainActivity.this,1,resultIntent,PendingIntent.FLAG_MUTABLE);
                    NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "My Notification")
                            .setContentTitle("Update")
                            .setContentText("Recommendations List has been Updated!")
                            .setSmallIcon(R.drawable.img)
                            .setAutoCancel(true)
                            .setPriority(NotificationCompat.PRIORITY_MAX)
                            .setContentIntent(resultPendingIntent);
                    NotificationManagerCompat managerCompat = NotificationManagerCompat.from(MainActivity.this);
                    managerCompat.notify(1, builder.build());
                } else if("WebtoApp: Update Error".equals(message)){
                    Intent resultIntent = new Intent(MainActivity.this, MainActivity.class);
                    PendingIntent resultPendingIntent = PendingIntent.getActivity(MainActivity.this,1,resultIntent,PendingIntent.FLAG_MUTABLE);
                    NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "My Notification")
                            .setContentTitle("Update")
                            .setContentText("An Error Occured, List was not been Updated!")
                            .setSmallIcon(R.drawable.img)
                            .setAutoCancel(true)
                            .setPriority(NotificationCompat.PRIORITY_MAX)
                            .setContentIntent(resultPendingIntent);
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
            webView.setLayoutParams(new ConstraintLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.MATCH_PARENT
            ));
            constraintSet.applyTo(constraintLayout);
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl("file:///android_asset/www/index.html");
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        webView.setKeepScreenOn(true);
        webView.resumeTimers();
        webView.setVisibility(View.VISIBLE);
        webView.onWindowSystemUiVisibilityChanged(View.VISIBLE);
        webView.onWindowVisibilityChanged(View.VISIBLE);
        MainActivity.this.setVisible(true);
        MainActivity.this.requestVisibleBehind(true);
    }

     // Keep WebView Running on Background
     class MediaWebView extends WebView {
         public MediaWebView(Context context) {
             super(context);
         }
         public MediaWebView(Context context, AttributeSet attrs) {
             super(context, attrs);
         }
         public MediaWebView(Context context, AttributeSet attrs, int defStyleAttr) {
             super(context, attrs, defStyleAttr);
         }
         @Override
         public void onWindowSystemUiVisibilityChanged(int visibility) {
             if(visibility != View.GONE) {
                 super.resumeTimers();
                 super.setVisibility(View.VISIBLE);
                 super.setKeepScreenOn(true);
                 super.onWindowSystemUiVisibilityChanged(View.VISIBLE);
                 super.onWindowVisibilityChanged(View.VISIBLE);
                 MainActivity.this.setVisible(true);
                 MainActivity.this.requestVisibleBehind(true);
             }
         }
         @Override
         protected void onWindowVisibilityChanged(int visibility) {
             if(visibility != View.GONE) {
                 super.resumeTimers();
                 super.setVisibility(View.VISIBLE);
                 super.setKeepScreenOn(true);
                 super.onWindowSystemUiVisibilityChanged(View.VISIBLE);
                 super.onWindowVisibilityChanged(View.VISIBLE);
                 MainActivity.this.setVisible(true);
                 MainActivity.this.requestVisibleBehind(true);
             }
         }
     }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        wakeLock.release();
    }

    // Native and Webview Connection
    class JSBridge {
        @RequiresApi(api = Build.VERSION_CODES.R)
        @JavascriptInterface
        public void exportJSON(String objStr, String fileName){
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
                            //String date = new SimpleDateFormat("GyyMMddHH").format(new Date());
                            File file = new File(directoryPath + fileName);
                            if (file.exists()) {
                                file.delete();
                            }
                            Files.write(Paths.get(file.getAbsolutePath()), objStr.getBytes());
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
                System.out.println(exportPath);
                prefsEdit.putString("savedExportPath",exportPath).apply();
                webView.loadUrl("javascript:" +
                        "exportPathIsAvailable=true;" +
                        "saveJSON(exportPathIsAvailable,'exportPathIsAvailable');"
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }
    }
}

//    public void exitApp(){
//        new AlertDialog.Builder(this)
//                .setTitle("Hey hey...")
//                .setMessage("Do you really want to Exit now?")
//                .setIcon(android.R.drawable.ic_dialog_alert)
//                .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
//                    @Override
//                    public void onClick(DialogInterface dialogInterface, int i) {
//                        finish();
//                        overridePendingTransition(com.google.android.material.R.anim.abc_fade_in, com.google.android.material.R.anim.abc_fade_out);
//                    }
//                })
//                .setNegativeButton("Later", null).show();
//    }


