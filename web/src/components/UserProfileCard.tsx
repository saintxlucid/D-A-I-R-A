import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
}

interface UserProfileCardProps {
  user: User;
  isCurrentUser?: boolean;
  onFollow?: (userId: string) => Promise<void>;
  onUnfollow?: (userId: string) => Promise<void>;
  isLoadingFollow?: boolean;
}

export function UserProfileCard({
  user,
  isCurrentUser = false,
  onFollow,
  onUnfollow,
  isLoadingFollow = false,
}: UserProfileCardProps) {
  const navigate = useNavigate();

  const handleFollowClick = async () => {
    if (user.isFollowing) {
      await onUnfollow?.(user.id);
    } else {
      await onFollow?.(user.id);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-slate-600 transition cursor-pointer"
      onClick={() => navigate(`/profile/${user.id}`)}
    >
      {/* Header */}
      <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600" />

      {/* Profile Content */}
      <div className="px-4 pb-4 relative">
        {/* Avatar */}
        <div className="flex items-end gap-3 mb-3">
          <div className="w-16 h-16 -mt-8 bg-slate-700 rounded-full border-4 border-slate-800 flex items-center justify-center text-2xl">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          {!isCurrentUser && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFollowClick();
              }}
              disabled={isLoadingFollow}
              className={`ml-auto px-4 py-2 rounded-lg font-semibold text-sm transition ${
                user.isFollowing
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:opacity-50`}
            >
              {isLoadingFollow ? 'Loading...' : user.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* User Info */}
        <h3 className="text-lg font-bold text-white">{user.username}</h3>
        <p className="text-sm text-slate-400 mb-2">@{user.email.split('@')[0]}</p>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-slate-300 mb-3 break-words line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-700">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{user.postsCount}</div>
            <div className="text-xs text-slate-400">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{user.followersCount}</div>
            <div className="text-xs text-slate-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{user.followingCount}</div>
            <div className="text-xs text-slate-400">Following</div>
          </div>
        </div>

        {/* Edit Profile Button */}
        {isCurrentUser && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/settings/profile');
            }}
            className="w-full mt-3 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition text-sm"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
