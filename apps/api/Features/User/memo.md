// UseCase 等での記述イメージ
var user = await dbContext.Users
    .Include(u => u.ThoughtRecords)
    .Include(u => u.QuoteRecords)
    .FirstOrDefaultAsync(u => u.Id == targetUserId);

// ユーザーを削除状態にする（子要素も一緒にRemoveに渡すか、手動でIsDeleted=trueにする）
dbContext.Users.Remove(user);
dbContext.ThoughtRecords.RemoveRange(user.ThoughtRecords);
dbContext.QuoteRecords.RemoveRange(user.QuoteRecords);

await dbContext.SaveChangesAsync(); // ここで全て論理削除（IsDeleted=true）に変換される