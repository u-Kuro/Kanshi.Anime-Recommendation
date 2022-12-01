package com.example.kanshi;

import static com.example.kanshi.Utils.*;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.constraintlayout.widget.ConstraintSet;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
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
import java.util.Objects;

public class MainActivity extends AppCompatActivity  {

    public SharedPreferences prefs;
    private SharedPreferences.Editor prefsEdit;

    private ValueCallback<Uri[]> mUploadMessage;
    private String exportPath;
    private MediaWebView webView;

    private PowerManager.WakeLock wakeLock;
    private NotificationManagerCompat managerCompat;
    private boolean isVisible = true;

    // Activity Results
    final ActivityResultLauncher<Intent> chooseImportFile =
            registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    new ActivityResultCallback<ActivityResult>() {
                        @Override
                        public void onActivityResult(ActivityResult activityResult) {
                            int resultCode = activityResult.getResultCode();
                            Intent intent = activityResult.getData();
                            try{
                                Uri[] result = null;
                                if (null == mUploadMessage || resultCode != RESULT_OK) {
                                    result = new Uri[]{Uri.parse("")};
                                } else {
                                    assert intent != null;
                                    String dataString = intent.getDataString();
                                    if (dataString != null) {
                                        result = new Uri[]{Uri.parse(dataString)};
                                    }
                                }
                                mUploadMessage.onReceiveValue(result);
                                mUploadMessage = null;
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    }
            );
    final ActivityResultLauncher<Intent> chooseExportFile =
            registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    new ActivityResultCallback<ActivityResult>() {
                        @Override
                        public void onActivityResult(ActivityResult activityResult) {
                            int resultCode = activityResult.getResultCode();
                            Intent intent = activityResult.getData();
                            try{
                                if (resultCode != RESULT_OK){return;}
                                assert intent != null;
                                Uri uri = intent.getData();
                                Uri docUri = DocumentsContract.buildDocumentUriUsingTree(uri,
                                        DocumentsContract.getTreeDocumentId(uri));
                                exportPath = getThisPath(docUri);
                                Toast.makeText(getApplicationContext(), "Export Folder is Selected, you may Export now!", Toast.LENGTH_LONG).show();
                                System.out.println(exportPath);
                                prefsEdit.putString("savedExportPath",exportPath).apply();
                                webView.loadUrl("javascript:" +
                                        "exportPathIsAvailable=true;" +
                                        "try {\n" +
                                        "    var write = db.transaction(\"MyObjectStore\",\"readwrite\").objectStore(\"MyObjectStore\").openCursor();\n" +
                                        "    write.onsuccess = (event) => {\n" +
                                        "        const cursor = event.target.result;\n" +
                                        "        if (cursor) {\n" +
                                        "            if(cursor.key==='exportPathIsAvailable'){\n" +
                                        "                cursor.update(exportPathIsAvailable);\n" +
                                        "            }\n" +
                                        "            cursor.continue();\n" +
                                        "        } else {\n" +
                                        "            db.transaction(\"MyObjectStore\",\"readwrite\").objectStore(\"MyObjectStore\").add(exportPathIsAvailable, 'exportPathIsAvailable');\n" +
                                        "        }\n" +
                                        "    }\n" +
                                        "} catch(ex) {\n" +
                                        "    try{\n" +
                                        "        console.error(ex);\n" +
                                        "        db.transaction(\"MyObjectStore\",\"readwrite\").objectStore(\"MyObjectStore\").add(exportPathIsAvailable, 'exportPathIsAvailable');\n" +
                                        "     } catch(ex2){\n" +
                                        "        console.error(ex2);\n" +
                                        "        localStorage.setItem('exportPathIsAvailable', JSON.stringify(exportPathIsAvailable));\n" +
                                        "     }\n" +
                                        "}"
                                    );
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    }
            );
    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        // Keep Awake on Lock Screen
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "KeepAwake:");
        wakeLock.acquire(10*60*1000L);
        // Hide Action Bar
        Objects.requireNonNull(getSupportActionBar()).hide();
        // Shared Preference
        prefs = MainActivity.this.getSharedPreferences("com.example.kanshi", Context.MODE_PRIVATE);
        prefsEdit = prefs.edit();
        // Saved Data
        exportPath = prefs.getString("savedExportPath", "");
        // Create WebView App Instance
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        // Add WebView on Layout
        ConstraintLayout constraintLayout = findViewById(R.id.activity_main);
        webView = new MediaWebView(MainActivity.this);
        webView.setId(R.id.webView);
        constraintLayout.addView(webView);
        // Add WebView Layout Style
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
        webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("My Notification","My Notification", NotificationManager.IMPORTANCE_DEFAULT);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
        // Set WebView Configs
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);
        webView.setLongClickable(true);
        webView.setKeepScreenOn(true);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
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
                            .setType("application/json");// set MIME type to filter
                    chooseImportFile.launch(i);
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
                            .setPositiveButton("OK", (dialogInterface, i) -> {
                                Uri uri = Uri.parse("package:${BuildConfig.APPLICATION_ID}");
                                Toast.makeText(getApplicationContext(), "Enable Kanshi. App in here to permit Data Export!", Toast.LENGTH_LONG).show();
                                startActivity(new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri));
                            })
                            .setNegativeButton("Later", null).show();
                    } else {
                        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
                                .addCategory(Intent.CATEGORY_DEFAULT);
                        chooseExportFile.launch(i);
                        Toast.makeText(getApplicationContext(), "Select or Create a Directory!", Toast.LENGTH_LONG).show();
                    }
                } else if("WebtoApp: List is Updated".equals(message)){
                    if(isVisible){
                        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            v.vibrate(VibrationEffect.createWaveform(new long[] {0, 250, 250, 250},-1));
                        } else {
                            v.vibrate(250);
                        }
                    } else {
                        Intent resultIntent = new Intent(MainActivity.this, MainActivity.class);
                        PendingIntent resultPendingIntent = null;
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                            resultPendingIntent = PendingIntent.getActivity(MainActivity.this, 1, resultIntent, PendingIntent.FLAG_MUTABLE);
                        }
                        NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "My Notification")
                                .setContentTitle("Update")
                                .setContentText("Recommendations List has been Updated!")
                                .setSmallIcon(R.drawable.img)
                                .setAutoCancel(true)
                                .setPriority(NotificationCompat.PRIORITY_MAX)
                                .setContentIntent(resultPendingIntent);
                        managerCompat = NotificationManagerCompat.from(MainActivity.this);
                        managerCompat.notify(1, builder.build());
                    }
                } else if("WebtoApp: Update Error".equals(message)){
                    if(isVisible){
                        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            v.vibrate(VibrationEffect.createWaveform(new long[] {0, 250, 250, 250},-1));
                        } else {
                            v.vibrate(250);
                        }
                    } else {
                        Intent resultIntent = new Intent(MainActivity.this, MainActivity.class);
                        PendingIntent resultPendingIntent = null;
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                            resultPendingIntent = PendingIntent.getActivity(MainActivity.this, 1, resultIntent, PendingIntent.FLAG_MUTABLE);
                        }
                        NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "My Notification")
                                .setContentTitle("Update")
                                .setContentText("An Error Occured, List was not been Updated!")
                                .setSmallIcon(R.drawable.img)
                                .setAutoCancel(true)
                                .setPriority(NotificationCompat.PRIORITY_MAX)
                                .setContentIntent(resultPendingIntent);
                        managerCompat = NotificationManagerCompat.from(MainActivity.this);
                        managerCompat.notify(1, builder.build());
                    }
                }
                Log.d("WebConsole",message+"-"+lineNumber);
                return true;
            }
        });
        // Load the Saved/Page
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    // Get Path From MainActivity Context
    public String getThisPath(Uri docUri){
        return getPath(this, docUri);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        isVisible = hasFocus;
        if(hasFocus&&managerCompat!=null){
            managerCompat.cancelAll();
        }
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
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            Uri uri = Uri.parse("package:${BuildConfig.APPLICATION_ID}");
                            Toast.makeText(getApplicationContext(), "Enable Kanshi. App in here to permit Data Export!", Toast.LENGTH_LONG).show();
                            startActivity(new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri));
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
                } else if(!Objects.equals(exportPath, "") &&!new File(exportPath).isDirectory()){
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
                            .setPositiveButton("Choose a Folder", (dialogInterface, x) -> {
                                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
                                        .addCategory(Intent.CATEGORY_DEFAULT);
                                chooseExportFile.launch(i);
                                Toast.makeText(getApplicationContext(), "Select or Create a Directory!", Toast.LENGTH_LONG).show();
                            })
                            .setNegativeButton("Later", null).show();
                } else {
                    Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
                            .addCategory(Intent.CATEGORY_DEFAULT);
                    chooseExportFile.launch(i);
                    Toast.makeText(getApplicationContext(), "Select or Create a Directory!", Toast.LENGTH_LONG).show();
                }
            }
        }
    }
}

