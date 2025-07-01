package go.green.customer;


import android.app.Service;
import android.content.Intent;
import android.os.IBinder;


import android.util.Log;
import android.content.Context;


import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;


import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;


public class MyFirebaseMessagingService extends FirebaseMessagingService {


    private static final String TAG = "MyFirebaseMsgService";


    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {




        Log.d(TAG, "From: " + remoteMessage.getFrom());




        if(remoteMessage.getData().size() > 0){
            Log.d(TAG, "Message data payload: " + remoteMessage.getData());


            if(true){


                schedulejob();
            } else {


                handleNow();
            }
        }




        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Message Notification Body: " + remoteMessage.getNotification().getBody());
        }






  }


  private void schedulejob(){


    OneTimeWorkRequest work = new OneTimeWorkRequest.Builder(MyWorker.class).build();
    WorkManager.getInstance(this).enqueue(work);


  }


  private void handleNow(){
    Log.d(TAG, "Short lived task is done.");
  }


  public static class MyWorker extends Worker{
    public MyWorker(@NonNull Context context, @NonNull WorkerParameters workerParams){
      super(context, workerParams);
    }


    @NonNull
    @Override
    public Result doWork(){


        return Result.success();
    }
  }
}
